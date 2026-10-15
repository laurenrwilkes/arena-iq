// Human-readable run report (Markdown). Mirrors the dashboard sections.
const pct = x => (x == null ? 'n/a' : `${(100 * x).toFixed(1)}%`);

function renderMarkdown(run) {
  const { engagement: e, gaps, hypotheses, experiments, findings, questionAudit, meta } = run;
  const L = [];
  L.push(`# QuantBattle engagement agent: run ${meta.runId}`);
  L.push('');
  L.push(`Generated ${meta.generatedAt}. Data source: **${meta.dataSource}**. Hypotheses: **${meta.hypothesisSource}**.`);
  if (e.synthetic) L.push('\n> **SYNTHETIC DATA.** GA4 numbers below are generated for a dry run and say nothing about real users. Set GA4_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS for real data.');
  if (!e.available && !e.synthetic) L.push('\n> No GA4 data in this run (code-only). Traffic tables are empty, not zero.');
  if (meta.llmError) L.push(`\n> LLM step failed (${meta.llmError}); the rule-based hypotheses are shown instead.`);

  L.push('\n## 1. Current engagement (GA4)\n');
  L.push(`| Segment | Users | Sessions | Engagement rate | Engaged s/user |\n|---|---:|---:|---:|---:|`);
  L.push(`| All | ${e.overall.activeUsers} | ${e.overall.sessions} | ${pct(e.overall.engagementRate)} | ${Math.round(e.overall.engagementSecondsPerUser || 0)} |`);
  for (const [k, s] of [...Object.entries(e.byTenure), ...Object.entries(e.byDevice)]) {
    L.push(`| ${k} | ${s.activeUsers} | ${s.sessions} | ${pct(s.engagementRate)} | ${Math.round(s.engagementSecondsPerUser || 0)} |`);
  }
  L.push('\n| Funnel | Rate | n | 95% CI |\n|---|---:|---:|---|');
  for (const f of e.funnels.overall) L.push(`| ${f.label} | ${pct(f.rate)} | ${f.to}/${f.from} | ${pct(f.lower)}–${pct(f.upper)} |`);
  if (e.deviceGaps.length) {
    L.push('\n**Device gaps (observational):**');
    e.deviceGaps.forEach(g => L.push(`- ${g.label}: ${g.device} ${pct(g.deviceRate)} vs others ${pct(g.othersRate)}`));
  }
  if (Object.keys(e.errors || {}).length) L.push(`\nGA4 report errors: ${JSON.stringify(e.errors)}`);

  L.push('\n## 2. What is measurable today\n');
  L.push('| Metric | Status | Missing |\n|---|---|---|');
  for (const ev of gaps.evaluations) {
    L.push(`| ${ev.name} | ${ev.status} | ${ev.missing.map(m => m.event === '(server)' ? 'server storage' : `${m.event}[${m.params.join(', ')}]`).join('; ') || '—'} |`);
  }

  L.push('\n## 3. Proposed instrumentation\n');
  L.push('**Foundations (do first):**');
  gaps.plan.foundations.forEach(f => L.push(`- ${f.alreadyDone ? '~~' : ''}**${f.title}**${f.alreadyDone ? '~~ (done)' : ''}: ${f.why}\n  - ${f.change}`));
  L.push('\n**Events:**\n\n| Event | Action | Params | Unlocks | Where |\n|---|---|---|---|---|');
  gaps.plan.events.forEach(ev => L.push(`| \`${ev.event}\` | ${ev.action} | ${ev.params.join(', ')} | ${ev.unlocks.join(', ')} | ${ev.where.join('; ') || ev.locations.join(', ')} |`));
  if (gaps.plan.serverChanges.length) {
    L.push('\n**Server:**');
    gaps.plan.serverChanges.forEach(s => L.push(`- (${s.metric}) ${s.change}`));
  }

  L.push('\n## 4. Prioritised hypotheses\n');
  hypotheses.forEach(h => {
    L.push(`### ${h.id}. ${h.title}  _(${h.area}, confidence: ${h.confidence})_`);
    L.push(`- **Observation:** ${h.observation}`);
    L.push(`- **Hypothesis:** ${h.hypothesis}`);
    L.push(`- **Intervention:** ${h.intervention}`);
    L.push(`- **Primary metric:** ${h.primaryMetric || 'n/a (measurement fix)'}; guardrails: ${(h.guardrails || []).join(', ') || 'n/a'}`);
    L.push(`- **Causal status:** ${h.causalStatus}`);
    L.push(`- **Evidence:** ${h.evidence.map(id => `\`${id}\``).join(', ')}`);
    if (h.requiredInstrumentation?.length) L.push(`- **Needs instrumentation:** ${h.requiredInstrumentation.join(', ')}`);
    if (h.priorityRationale) L.push(`- **Why this rank:** ${h.priorityRationale}`);
    L.push('');
  });

  L.push('## 5. Proposed experiments\n');
  experiments.forEach(x => {
    L.push(`### ${x.id}: ${x.title} (${x.status})`);
    L.push(`- **Hypothesis:** ${x.hypothesis.statement}`);
    x.variants.forEach(v => L.push(`- **${v.key}:** ${v.description}`));
    L.push(`- **Primary metric:** ${x.primaryMetric.id} (${x.primaryMetric.direction}); baseline ${pct(x.primaryMetric.baseline)} (${x.primaryMetric.baselineSource})`);
    L.push(`- **Guardrails:** ${x.guardrails.map(g => `${g.id} (harm = ${g.harmDirection})`).join(', ')}`);
    const s = x.stoppingRule;
    L.push(`- **Stopping rule:** mSPRT, alpha ${s.alpha}, MDE ${pct(s.mdeAbsolute)} abs; min ${s.minDaysRunning} days & ${s.minUnitsPerArm}/arm; cap ${s.maxUnitsPerArm}/arm or ${s.maxDays} days.`);
    L.push(`- **Feasibility:** ${x.feasibility.note}`);
    L.push(`- **Prerequisites before approval:** ${x.prerequisites.filter(p => !p.satisfied).map(p => p.description).join('; ') || 'all met'}`);
    L.push('- **Code changes:**'); x.codeChangeOutline.forEach(c => L.push(`  - ${c}`));
    L.push('');
  });

  if (run.questionReviews?.length) {
    L.push('## 6. Question review queue (for human review)\n');
    L.push('| Question | Issue | Suggested clarification |\n|---|---|---|');
    run.questionReviews.forEach(q => L.push(`| ${q.question_id} | ${q.issue} | ${q.suggested_clarification} |`));
  } else {
    L.push('## 6. Question audit\n');
    L.push(`${questionAudit.flagged.length} of ${questionAudit.totalQuestions} questions flagged: ${Object.entries(questionAudit.issueCounts).map(([k, v]) => `${k} (${v})`).join(', ')}.`);
  }

  if (run.followUps?.length) {
    L.push('\n## 7. Follow-up questions\n');
    run.followUps.forEach(q => L.push(`- ${q}`));
  }

  L.push('\n## Appendix: findings\n');
  findings.forEach(f => L.push(`- \`${f.id}\` (${f.kind}) ${f.statement}`));
  return L.join('\n') + '\n';
}

module.exports = { renderMarkdown };
