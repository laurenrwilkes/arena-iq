// Unit-level binary metrics usable in experiments. Each is "share of exposed
// anon_ids with <event pattern>", which keeps the unit of analysis equal to
// the unit of randomisation (no clustering problems in the stats).

const EXPERIMENT_METRICS = {
  bot_battle_completion: {
    definition: 'Share of exposed units whose bot battles all reached the result screen (no game_abandoned with opponent_type=bot).',
    dependsOn: ['opponent_type_mix', 'abandonment_by_difficulty'],
    baselineFunnel: 'battle_finish', defaultBaseline: 0.6, direction: 'increase',
  },
  next_game_start_rate: {
    definition: 'Share of exposed units who start another game within 10 minutes of a result screen.',
    dependsOn: ['next_game_start_rate'], defaultBaseline: 0.35, direction: 'increase',
  },
  affected_question_abandon_rate: {
    definition: 'Among exposed units presented at least one affected question, the share who abandon the game while that question is on screen.',
    dependsOn: ['abandonment_by_difficulty'], defaultBaseline: 0.12, direction: 'decrease',
  },
  affected_question_solve_rate: {
    definition: 'Among exposed units presented an affected question, the share who answer at least one correctly.',
    dependsOn: ['question_solve_rate'], defaultBaseline: 0.45, direction: 'increase',
  },
  game_completion_rate: {
    definition: 'Share of exposed units whose games all end by finish or timer (not game_abandoned).',
    dependsOn: ['abandonment_by_difficulty'], baselineFunnel: 'solo_finish', defaultBaseline: 0.65, harmDirection: 'decrease',
  },
  premature_exit_rate: {
    definition: 'Share of exposed units with a game_abandoned before their first submission in any game.',
    dependsOn: ['abandonment_by_difficulty'], defaultBaseline: 0.15, harmDirection: 'increase',
  },
  next_day_return: {
    definition: 'Share of exposed units active again 1-7 days after first exposure.',
    dependsOn: [], baselineFunnel: 'next_day_return', defaultBaseline: 0.1, harmDirection: 'decrease',
  },
  question_dispute_rate: {
    definition: 'Share of exposed units who flag at least one question.',
    dependsOn: ['question_dispute_rate'], defaultBaseline: 0.02, harmDirection: 'increase',
  },
  client_error_rate: {
    definition: 'Share of exposed units with at least one client error (Sentry event tagged with experiment variant).',
    dependsOn: [], defaultBaseline: 0.03, harmDirection: 'increase',
  },
};

module.exports = { EXPERIMENT_METRICS };
