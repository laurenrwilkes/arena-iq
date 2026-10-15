// Builds the cumulative per-variant snapshot the agent's analyze() expects,
// from raw game_events rows. Unit = anon_id; every metric is "share of
// exposed units with <pattern> after first exposure".
const DAY = 86400000;

function parse(row) {
  let props = {};
  try { props = row.props ? JSON.parse(row.props) : {}; } catch (_) {}
  return { ...row, props, t: Date.parse(row.received_at) };
}

const isAbandon = e => e.event === 'game_abandoned';

// Each metric: (events after first exposure, exposure time) -> boolean.
const METRICS = {
  bot_battle_completion: evs => !evs.some(e => isAbandon(e) && e.props.game === 'battle' && e.props.opponent_type === 'bot'),
  game_completion_rate: evs => !evs.some(isAbandon),
  premature_exit_rate: evs => evs.some(e => isAbandon(e) && Number(e.props.submitted || 0) === 0),
  next_day_return: (evs, t0) => evs.some(e => e.t >= t0 + DAY && e.t <= t0 + 8 * DAY),
  client_error_rate: evs => evs.some(e => e.event === 'client_error'),
  question_dispute_rate: evs => evs.some(e => e.event === 'question_flagged'),
  next_game_start_rate: evs => {
    const results = evs.filter(e => e.event === 'battle_finished' || e.event === 'game_completed');
    return results.some(r => evs.some(e => (e.event === 'battle_started' || e.event === 'game_started') && e.t > r.t && e.t - r.t <= 10 * 60000));
  },
  affected_question_abandon_rate: evs => {
    const affected = new Set(evs.filter(e => e.event === 'question_presented' && e.props.affected).map(e => e.question_id));
    return evs.some(e => isAbandon(e) && affected.has(e.question_id));
  },
  affected_question_solve_rate: evs => evs.some(e => e.event === 'question_answered' && e.props.affected && e.props.correct === true),
};

function buildSnapshot(experiment, rows, asOf = new Date().toISOString().slice(0, 10)) {
  const byUnit = new Map();
  for (const raw of rows) {
    const e = parse(raw);
    if (!byUnit.has(e.anon_id)) byUnit.set(e.anon_id, []);
    byUnit.get(e.anon_id).push(e);
  }

  const variants = {};
  for (const v of experiment.variants) {
    variants[v.key] = { units: 0, primary: { successes: 0 }, guardrails: Object.fromEntries(experiment.guardrails.map(g => [g.id, { successes: 0 }])) };
  }
  const unknown = [];
  for (const [, evs] of byUnit) {
    const exposure = evs.find(e => e.event === 'experiment_exposure' && e.props.experiment_id === experiment.id);
    if (!exposure) continue;
    const arm = variants[exposure.props.variant];
    if (!arm) continue;
    arm.units++;
    const primaryFn = METRICS[experiment.primaryMetric.id];
    if (!primaryFn) unknown.push(experiment.primaryMetric.id);
    else if (primaryFn(evs, exposure.t)) arm.primary.successes++;
    for (const g of experiment.guardrails) {
      const fn = METRICS[g.id];
      if (!fn) { unknown.push(g.id); continue; }
      if (fn(evs, exposure.t)) arm.guardrails[g.id].successes++;
    }
  }
  return { asOf, variants, unknownMetrics: [...new Set(unknown)] };
}

module.exports = { buildSnapshot, METRICS };
