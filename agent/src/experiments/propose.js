// Turn an experiment *design* (from the LLM or the default templates) into a
// full, validated spec. Everything numeric — baseline, MDE, sample size,
// stopping rule, feasibility at current traffic — is computed here.
const stats = require('../stats');
const { EXPERIMENT_METRICS } = require('./metrics');

// Default designs used when no LLM is configured. The LLM may replace the
// prose, but metrics must come from EXPERIMENT_METRICS either way.
// `implemented: true` means the treatment code for this design already exists
// in the app, so the LLM may suggest alternatives but cannot replace it.
const DEFAULT_DESIGNS = {
  pacing: {
    implemented: true,
    slug: 'bot-battle-instant-resolve',
    title: 'Resolve bot battles as soon as the player is done',
    hypothesis_key: 'pacing.bot_dead_wait',
    hypothesis_statement: 'Removing the non-interactive wait for the bot\'s simulated finish (up to 85/140/230s by difficulty) will increase the share of players whose bot battles reach the result screen.',
    control_description: 'Current behaviour: after a wrong (single-question) or imperfect (multi-question) submission, the player waits until the bot\'s scheduled finish time.',
    treatment_description: 'As soon as the player has submitted their final answer, the bot\'s result is drawn immediately from the same accuracy distribution (BOT_ACCURACY) and the result screen is shown. Win/loss probabilities are unchanged; only the wait is removed. Quant Battle is not affected.',
    primary_metric: 'bot_battle_completion',
    guardrails: ['premature_exit_rate', 'next_day_return', 'client_error_rate'],
    code_change_outline: [
      'server/index.js startBotMatch: keep the bot resolution in a named function; in the treatment arm call it (and clear the pending timers) from submit_answer once the human has finished.',
      'socket auth: accept anonId in handshake auth; server computes the variant with agent/src/flags/assign.js (same file served to the client as /flags.js).',
      'match_found payload: include { experiment_id, variant } so the client can fire experiment_exposure once.',
      'Default to control whenever the experiment is not live (unapproved, edited after approval, or missing anonId).',
    ],
    risks: ['Faster losses might feel abrupt; watch premature_exit_rate.', 'The bot\'s "thinking" status messages no longer appear in treatment.'],
    evidence: ['F-CODE-pacing.bot_wait.hard', 'F-CODE-pacing.matchmaking', 'F-GA-funnel-battle_finish'],
  },
  question_quality: {
    implemented: true,
    slug: 'clarified-answer-format',
    title: 'Explicit units and rounding on ambiguous numeric questions',
    hypothesis_key: 'quality.ambiguous_answer_format',
    hypothesis_statement: 'Adding explicit unit and rounding instructions to numeric questions the audit flagged as ambiguous will reduce abandonment while those questions are on screen.',
    control_description: 'Current question text.',
    treatment_description: 'For audit-flagged questions only, show a human-reviewed clarification (e.g. "Answer in minutes, rounded to 4 decimal places"). Answers, tolerances and all other questions are unchanged.',
    primary_metric: 'affected_question_abandon_rate',
    guardrails: ['question_dispute_rate', 'game_completion_rate', 'client_error_rate'],
    code_change_outline: [
      'server/question-clarifications.js: map of question_id -> reviewed clarification text (drafted by the agent, approved by a human).',
      'Serve clarified descriptions to treatment units in /api/questions and buildTacticalSet; control receives the original text.',
      'question_presented carries { question_id, affected: true|false, variant } so analysis can restrict to affected questions.',
      'Persist /api/flag into a question_flags table so the dispute guardrail is measurable.',
    ],
    risks: ['Clarifications could make questions easier; that is acceptable but should be visible via affected_question_solve_rate (secondary).', 'Small affected set means slow accumulation.'],
    evidence: ['F-Q-ambiguous-format', 'F-CODE-flags-lost'],
  },
};

const EXPOSURE_FUNNEL = { pacing: 'battle_finish', question_quality: 'practice_view_to_submit' };

function round(x, d = 3) { return Math.round(x * 10 ** d) / 10 ** d; }

function stoppingRuleFor(baseline, direction) {
  // MDE: 15% relative, clamped to [2pp, 10pp]. Tau (mSPRT mixing scale) = MDE.
  const mde = Math.min(0.1, Math.max(0.02, round(baseline * 0.15)));
  const signed = direction === 'decrease' ? -mde : mde;
  const safeBaseline = Math.min(0.98, Math.max(0.02, baseline));
  const fixedN = stats.sampleSizePerArm(safeBaseline, Math.min(signed, 0.97 - safeBaseline));
  // The mSPRT trades some power for continuous monitoring; cap at ~1.5x the
  // fixed-horizon size so null results end as "inconclusive" in finite time.
  const maxUnitsPerArm = Math.ceil(fixedN * 1.5);
  return {
    method: 'msprt', alpha: 0.05, tau: mde, mdeAbsolute: mde,
    fixedHorizonUnitsPerArm: fixedN,
    minUnitsPerArm: Math.min(200, Math.ceil(maxUnitsPerArm / 4)),
    maxUnitsPerArm,
    minDaysRunning: 14, // two full weekly cycles before any primary-metric call
    maxDays: 42,
  };
}

function buildExperiment(area, design, ctx) {
  const { id, gaps, engagement, codebase } = ctx;
  const primaryDef = EXPERIMENT_METRICS[design.primary_metric];
  if (!primaryDef) throw new Error(`Unknown primary metric ${design.primary_metric}`);

  const funnel = primaryDef.baselineFunnel && engagement.funnels.overall.find(f => f.id === primaryDef.baselineFunnel);
  const measuredBaseline = funnel && funnel.from >= 50 && funnel.rate != null && !engagement.synthetic ? funnel.rate : null;
  const baseline = measuredBaseline ?? primaryDef.defaultBaseline;
  const direction = primaryDef.direction;
  const stoppingRule = stoppingRuleFor(baseline, direction);

  // Feasibility: eligible units/day from GA4 (users reaching the exposure point).
  const exposureFunnel = engagement.funnels.overall.find(f => f.id === EXPOSURE_FUNNEL[area]);
  const lookback = ctx.lookbackDays || 28;
  const eligiblePerDay = exposureFunnel?.from && !engagement.synthetic ? exposureFunnel.from / lookback : null;
  const daysToMax = eligiblePerDay ? Math.ceil((2 * stoppingRule.maxUnitsPerArm) / eligiblePerDay) : null;

  // Prerequisites: every metric the experiment depends on must be measurable.
  const metricIds = [design.primary_metric, ...design.guardrails];
  const needed = [...new Set(metricIds.flatMap(m => EXPERIMENT_METRICS[m]?.dependsOn || []))];
  const prerequisites = [
    ...needed.map(mid => {
      const ev = gaps.evaluations.find(e => e.id === mid);
      // Experiment metrics come from the server event store, so the code
      // emitting the events is what matters (GA4 dimension registration isn't).
      return { id: `metric:${mid}`, description: `Metric "${ev?.name || mid}" is instrumented in code`, satisfied: !!ev && ev.missing.length === 0 };
    }),
    { id: 'foundation:anon_id', description: 'Pseudonymous qb_anon_id assigned after consent', satisfied: !!codebase.pseudonymousIdConfigured },
    { id: 'foundation:consent', description: 'Consent Mode default-deny in place; experiment events only fire with analytics consent', satisfied: !!codebase.consentModeConfigured },
    { id: 'foundation:exposure', description: 'experiment_exposure event emitted with experiment_id and variant', satisfied: codebase.events.some(e => e.name === 'experiment_exposure') },
    { id: 'review:code', description: 'Treatment code reviewed and merged behind the flag (default = control)', satisfied: false },
  ];
  if (area === 'question_quality') prerequisites.push({ id: 'review:content', description: 'Every clarification text reviewed and approved by a human', satisfied: false });

  return {
    id,
    title: design.title,
    area,
    status: 'proposed',
    createdAt: new Date().toISOString(),
    unit: 'anon_id',
    trafficAllocation: 1,
    hypothesis: { key: design.hypothesis_key, statement: design.hypothesis_statement, evidence: design.evidence },
    variants: [
      { key: 'control', weight: 1, description: design.control_description },
      { key: 'treatment', weight: 1, description: design.treatment_description },
    ],
    primaryMetric: { id: design.primary_metric, definition: primaryDef.definition, direction, baseline: round(baseline), baselineSource: measuredBaseline != null ? `GA4 funnel ${primaryDef.baselineFunnel}` : 'assumed (no usable measurement yet)' },
    guardrails: design.guardrails.map(g => ({ id: g, definition: EXPERIMENT_METRICS[g].definition, harmDirection: EXPERIMENT_METRICS[g].harmDirection || (EXPERIMENT_METRICS[g].direction === 'increase' ? 'decrease' : 'increase'), alpha: 0.05 })),
    stoppingRule,
    feasibility: {
      eligibleUnitsPerDay: eligiblePerDay != null ? round(eligiblePerDay, 1) : null,
      estimatedDaysToMaxUnits: daysToMax,
      note: daysToMax == null ? 'Unknown until GA4 traffic is available.'
        : daysToMax > stoppingRule.maxDays ? `At current traffic this needs ~${daysToMax} days, beyond the ${stoppingRule.maxDays}-day cap: expect "inconclusive" unless the effect is much larger than the MDE. Consider a larger MDE or running without competing experiments.`
          : `~${daysToMax} days at current traffic.`,
    },
    evaluationPlan: [
      'Analyse only units with an experiment_exposure event (intent-to-treat from first exposure).',
      'Daily: sample-ratio-mismatch check (chi-square, p < 0.001 pauses the experiment).',
      'Daily: guardrails via always-valid mSPRT p-values; any significant harm recommends revert immediately.',
      `Primary metric is not interpreted before ${stoppingRule.minDaysRunning} days and ${stoppingRule.minUnitsPerArm} units per arm.`,
      `After that, stop when the always-valid p < ${stoppingRule.alpha}, or at ${stoppingRule.maxUnitsPerArm} units per arm / ${stoppingRule.maxDays} days, whichever first; reaching the cap without significance is "inconclusive".`,
      'Report effect size with confidence interval, not just significance. A human makes the final keep/revert decision.',
    ],
    codeChangeOutline: design.code_change_outline,
    risks: design.risks,
    prerequisites,
    approval: null,
    analysisLog: [],
  };
}

module.exports = { DEFAULT_DESIGNS, buildExperiment, stoppingRuleFor };
