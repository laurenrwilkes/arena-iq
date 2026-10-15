// One full agent pass: observe -> diagnose -> discover metrics -> hypothesise
// -> propose experiments -> record history -> report.
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { fetchGa4 } = require('./ga4/client');
const { syntheticGa4 } = require('./ga4/synthetic');
const { inspectCodebase } = require('./inspect/codebase');
const { auditQuestions, loadQuestionBank, wordCount } = require('./inspect/questions');
const { analyzeGaps } = require('./metrics/gaps');
const { computeEngagement } = require('./metrics/engagement');
const { buildFindings } = require('./metrics/findings');
const { generateRuleHypotheses } = require('./hypotheses/rules');
const { proposeWithClaude } = require('./hypotheses/llm');
const { DEFAULT_DESIGNS, buildExperiment } = require('./experiments/propose');
const registry = require('./experiments/registry');
const history = require('./history/store');
const { renderMarkdown } = require('./report/markdown');
const { renderDashboard } = require('./report/dashboard');

function questionSamplesForReview(bank, audit) {
  const all = Object.entries(bank).flatMap(([cat, tiers]) => Object.entries(tiers).flatMap(([tier, list]) => list.map(q => ({ ...q, cat, tier }))));
  const flaggedIds = new Set(audit.flagged.map(f => f.id));
  const strip = s => (s || '').replace(/<[^>]+>/g, '').trim();
  const toSample = q => ({
    id: q.id, category: q.cat, tier: q.tier, title: q.title, text: strip(q.description),
    answer: q.answer, tolerance: q.tolerance, unit: q.unit,
    audit_issues: audit.flagged.find(f => f.id === q.id)?.issues.map(i => i.code) || [],
  });
  const numeric = all.filter(q => q.type === 'numeric');
  const flagged = numeric.filter(q => flaggedIds.has(q.id)).slice(0, 40);
  const step = Math.max(1, Math.floor(numeric.length / 15));
  const control = numeric.filter((q, i) => !flaggedIds.has(q.id) && i % step === 0).slice(0, 15);
  return [...flagged, ...control].map(toSample);
}

// Code-only run: no GA4 credentials, so no traffic findings at all (rather
// than synthetic ones). Writes to the real registry and history.
function emptyGa4(lookbackDays) {
  const empty = { rows: [], rowCount: 0, quality: {} };
  return { source: 'none', synthetic: false, propertyId: null, lookbackDays, fetchedAt: new Date().toISOString(), registeredParams: null, reports: { segments: empty, eventsBySegment: empty, pages: empty, daily: empty, cohorts: empty }, errors: { ga4: 'skipped (--no-ga4)' } };
}

function normaliseLlmHypothesis(h, i) {
  return {
    id: `H${i + 1}`, priority: i + 1, key: h.key, area: h.area, title: h.title,
    observation: h.observation, hypothesis: h.hypothesis, intervention: h.intervention,
    evidence: h.evidence, causalStatus: h.causal_status,
    primaryMetric: h.primary_metric === 'none' ? null : h.primary_metric,
    guardrails: h.guardrails, requiredInstrumentation: h.required_instrumentation,
    confidence: h.confidence, priorityRationale: h.priority_rationale, source: 'llm',
  };
}

function nextExperimentId(existing, slug) {
  const max = existing.reduce((m, x) => Math.max(m, Number(x.id.slice(4, 7)) || 0), 0);
  return `EXP-${String(max + 1).padStart(3, '0')}-${slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
}

async function runAgent(opts = {}) {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  // Synthetic dry runs get their own sandbox so they never pollute the real
  // experiment registry or history.
  const sandbox = opts.synthetic ? path.join(config.DATA_DIR, 'synthetic') : null;
  const dataDir = opts.dataDir || sandbox || config.DATA_DIR;
  const expDir = opts.experimentsDir || (sandbox ? path.join(sandbox, 'experiments') : config.EXPERIMENTS_DIR);
  const log = opts.log || (() => {});

  // Phase 1: observe
  log('Reading GA4…');
  const ga4 = opts.synthetic ? syntheticGa4({ lookbackDays: config.ga4.lookbackDays })
    : opts.ga4 === false ? emptyGa4(config.ga4.lookbackDays)
      : await fetchGa4({ propertyId: config.ga4.propertyId, lookbackDays: config.ga4.lookbackDays, client: opts.ga4Client });
  log('Inspecting codebase and question bank…');
  const codebase = inspectCodebase(opts.repoRoot || config.REPO_ROOT);
  const bank = loadQuestionBank(opts.repoRoot || config.REPO_ROOT);
  const questionAudit = auditQuestions(bank, codebase.server.constants);

  // Phase 2: metric discovery
  const gaps = analyzeGaps(codebase, ga4);
  const engagement = computeEngagement(ga4);
  const findings = buildFindings({ engagement, codebase, questionAudit, gaps });

  // Phase 3: hypotheses
  const priorOutcomes = history.priorOutcomesByKey({ dir: dataDir });
  const ruleHypotheses = generateRuleHypotheses(findings, priorOutcomes);
  let hypotheses = ruleHypotheses, designs = DEFAULT_DESIGNS, questionReviews = [], followUps = [];
  let hypothesisSource = 'rules (deterministic)', llmError = null;
  if (opts.llm !== false) {
    log(`Asking ${config.llm.model} for hypotheses…`);
    try {
      const out = await proposeWithClaude({ findings, questionSamples: questionSamplesForReview(bank, questionAudit), priorOutcomes, synthetic: engagement.synthetic }, { client: opts.anthropicClient });
      if (out.errors.length) throw new Error(out.errors.join('; '));
      hypotheses = out.hypotheses.map(normaliseLlmHypothesis);
      designs = { pacing: out.experiments.pacing, question_quality: out.experiments.question_quality };
      questionReviews = out.questionReviews;
      followUps = out.followUps;
      hypothesisSource = `LLM (${out.model}), validated against findings`;
    } catch (e) {
      llmError = e.message;
      log(`LLM step failed, using rule-based hypotheses: ${e.message}`);
    }
  }
  if (!followUps.length) {
    followUps = findings.filter(f => f.kind === 'gap').slice(0, 5).map(f => `Once instrumented: ${f.statement.replace(/^Cannot yet measure /, 'measure ')}`);
  }

  // Phase 4: experiment proposals (never auto-approved)
  const existing = registry.loadAll(expDir);
  const experiments = [];
  for (const area of ['pacing', 'question_quality']) {
    // A design whose code is already built wins; an LLM redesign is kept as
    // an alternative for a human to consider, never silently swapped in.
    const built = DEFAULT_DESIGNS[area].implemented ? DEFAULT_DESIGNS[area] : null;
    const design = built || designs[area];
    const alternative = built && designs[area] !== built ? designs[area] : null;
    const prev = existing.find(x => x.hypothesis?.key === design.hypothesis_key) || existing.find(x => x.area === area && x.status === 'proposed');
    if (prev && prev.status !== 'proposed') { experiments.push(prev); continue; } // don't touch approved/running/concluded
    const id = prev ? prev.id : nextExperimentId([...existing, ...experiments], design.slug);
    const exp = buildExperiment(area, design, { id, gaps, engagement, codebase, lookbackDays: ga4.lookbackDays });
    exp.codeImplemented = !!built;
    if (alternative) exp.alternativeDesign = { source: hypothesisSource, title: alternative.title, treatment: alternative.treatment_description, primaryMetric: alternative.primary_metric, rationale: alternative.hypothesis_statement };
    if (!opts.dryRun) registry.save(exp, expDir);
    experiments.push(exp);
  }
  for (const x of existing) if (!experiments.some(e => e.id === x.id)) experiments.push(x);

  // Phase 5: history
  const h = (type, data) => !opts.dryRun && history.append(type, data, { runId, dir: dataDir });
  h('observation', { dataSource: ga4.source, synthetic: !!ga4.synthetic, findings: findings.map(f => ({ id: f.id, kind: f.kind, statement: f.statement })) });
  gaps.evaluations.filter(e => e.status !== 'measurable').forEach(e => h('metric_proposal', { metric: e.id, status: e.status, missing: e.missing }));
  hypotheses.forEach(x => h('hypothesis', x));
  experiments.filter(x => x.status === 'proposed').forEach(x => h('code_change', { experimentId: x.id, status: 'proposed (not implemented, awaiting review)', outline: x.codeChangeOutline }));
  followUps.forEach(q => h('follow_up', { question: q }));

  const meta = { runId, dataDir, generatedAt: new Date().toISOString(), dataSource: ga4.synthetic ? 'SYNTHETIC (dry run)' : ga4.source === 'none' ? 'none (code-only run, GA4 skipped)' : `GA4 property ${ga4.propertyId}`, lookbackDays: ga4.lookbackDays, hypothesisSource, llmError };
  const run = { meta, engagement, codebase, questionAudit, gaps, findings, hypotheses, ruleHypotheses, experiments, questionReviews, followUps };

  // Reporting
  if (!opts.dryRun) {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'latest.json'), JSON.stringify(run, null, 2));
    fs.writeFileSync(path.join(dataDir, 'report.md'), renderMarkdown(run));
    fs.writeFileSync(path.join(dataDir, 'dashboard.html'), renderDashboard(run));
  }
  return run;
}

module.exports = { runAgent, questionSamplesForReview };
