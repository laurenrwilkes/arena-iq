// LLM layer: Claude reads the deterministic findings and proposes
// hypotheses, experiment designs and question rewrites. It never computes
// metrics: numbers in its output are ignored, every hypothesis must cite
// finding ids, and metric names are constrained to known enums.
const { EXPERIMENT_METRICS } = require('../experiments/metrics');
const { METRICS } = require('../metrics/catalog');
const config = require('../config');

const METRIC_ENUM = Object.keys(EXPERIMENT_METRICS);
const CATALOG_ENUM = METRICS.map(m => m.id);

const str = { type: 'string' };
const strArr = { type: 'array', items: str };
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

const design = obj({
  title: str, slug: str, hypothesis_key: str, hypothesis_statement: str,
  control_description: str, treatment_description: str,
  primary_metric: { type: 'string', enum: METRIC_ENUM },
  guardrails: { type: 'array', items: { type: 'string', enum: METRIC_ENUM } },
  code_change_outline: strArr, risks: strArr, evidence: strArr,
});

const SCHEMA = obj({
  hypotheses: {
    type: 'array',
    items: obj({
      key: str,
      area: { type: 'string', enum: ['pacing', 'question_quality', 'retention', 'device', 'onboarding', 'measurement'] },
      title: str, observation: str, hypothesis: str, intervention: str,
      evidence: strArr,
      causal_status: str,
      primary_metric: { type: 'string', enum: [...METRIC_ENUM, 'none'] },
      guardrails: { type: 'array', items: { type: 'string', enum: METRIC_ENUM } },
      required_instrumentation: { type: 'array', items: { type: 'string', enum: CATALOG_ENUM } },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      priority_rationale: str,
    }),
  },
  experiments: obj({ pacing: design, question_quality: design }),
  question_reviews: {
    type: 'array',
    items: obj({ question_id: str, issue: str, suggested_clarification: str }),
  },
  follow_up_questions: strArr,
});

const SYSTEM = `You are the analysis lead for QuantBattle (quantbattle.net), a site of timed quant/tech interview games: real-time battles (often against bots), Mental Math, Optiver 80-in-8, and a practice question bank.

Your job: propose explanations for disengagement and the experiments to test them, using ONLY the findings provided.

Rules:
- Every evidence list item must be exactly one finding id copied from the input (e.g. "F-CODE-pacing.bot_wait.hard"), with no other text. Do not cite ids that are not in the input.
- Do not compute or invent numbers. Refer to numbers only as they appear in findings.
- "measured" findings are correlational. "code" findings describe the product, not behaviour. "gap" findings mean we cannot measure something yet. State causal_status honestly; nothing here is causal until an experiment runs.
- Never infer question-level behaviour from session-level GA4 data.
- If data is marked SYNTHETIC, say the hypotheses are illustrative and lower confidence accordingly.
- Prefer small, reversible interventions behind a feature flag. Do not propose redesigning the site.
- Rank hypotheses by expected impact x strength of evidence x ease; explain the ranking in priority_rationale.
- Use past experiment outcomes: do not re-propose settled ideas; revisit inconclusive ones only if new instrumentation changes the picture.
- Experiments: one pacing, one question-quality. Each needs one primary metric and at least one guardrail from the allowed metric list. Do not specify sample sizes or stopping thresholds; those are computed by code.
- question_reviews: examine the provided question texts for ambiguity (units, rounding, wording, possible incorrect answers). Suggest clarifications a human can review; do not change answers.
- Return exactly 5 hypotheses.`;

function buildContext({ findings, questionSamples, priorOutcomes, synthetic }) {
  return {
    synthetic,
    findings: findings.map(f => ({ id: f.id, kind: f.kind, statement: f.statement })),
    allowed_experiment_metrics: Object.fromEntries(Object.entries(EXPERIMENT_METRICS).map(([k, v]) => [k, v.definition])),
    instrumentation_catalog: METRICS.map(m => ({ id: m.id, name: m.name, question: m.question })),
    prior_experiment_outcomes: priorOutcomes,
    questions_for_review: questionSamples,
  };
}

function validate(parsed, findingIds) {
  const errors = [];
  const known = new Set(findingIds);
  // The model sometimes wraps ids ("`F-Q-summary` (content)"); pull out every
  // id-shaped token, then keep only ids that really exist.
  const extract = list => [...new Set(list.flatMap(s => String(s).match(/F-[A-Za-z0-9_.-]*[A-Za-z0-9_]/g) || []))];
  const hyps = (parsed.hypotheses || []).map(h => {
    const ids = extract(h.evidence);
    return { ...h, evidence: ids.filter(id => known.has(id)), droppedEvidence: [...ids.filter(id => !known.has(id)), ...h.evidence.filter(s => !/F-/.test(s))] };
  }).filter(h => {
    if (!h.evidence.length) { errors.push(`hypothesis "${h.title}" cites no valid findings (got: ${h.droppedEvidence.slice(0, 3).join(' | ')}); rejected`); return false; }
    return true;
  });
  if (hyps.length < 5) errors.push(`only ${hyps.length} valid hypotheses (need 5)`);
  for (const area of ['pacing', 'question_quality']) {
    const d = parsed.experiments?.[area];
    if (!d) { errors.push(`missing ${area} experiment`); continue; }
    if (!d.guardrails.length) errors.push(`${area} experiment has no guardrails`);
    d.evidence = extract(d.evidence).filter(id => known.has(id));
  }
  return { errors, hypotheses: hyps.slice(0, 5), experiments: parsed.experiments, questionReviews: parsed.question_reviews || [], followUps: parsed.follow_up_questions || [] };
}

async function proposeWithClaude(input, { client } = {}) {
  if (!client) {
    const mod = require('@anthropic-ai/sdk');
    const Anthropic = mod.default || mod;
    client = new Anthropic();
  }
  const context = buildContext(input);
  const stream = client.beta.messages.stream({
    model: config.llm.model,
    max_tokens: 64000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: config.llm.effort, format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: `Analysis input (JSON):\n\n${JSON.stringify(context, null, 1)}` }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === 'refusal') throw new Error(`Model declined: ${message.stop_details?.explanation || 'no detail'}`);
  if (message.stop_reason === 'max_tokens') throw new Error('Model output truncated (max_tokens)');
  const text = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const parsed = JSON.parse(text);
  const result = validate(parsed, input.findings.map(f => f.id));
  return { ...result, model: message.model, usage: message.usage };
}

module.exports = { proposeWithClaude, validate, SCHEMA, buildContext };
