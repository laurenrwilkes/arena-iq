// Deterministic hypothesis generator. Used when no LLM is available, as a
// sanity baseline for LLM output, and in tests. Each template fires only if
// its evidence findings exist, and is scored on evidence + reach + ease,
// minus a penalty if history shows it was already settled.

const TEMPLATES = [
  {
    key: 'pacing.bot_dead_wait',
    area: 'pacing',
    title: 'Dead waiting time in bot battles',
    needsAny: ['F-CODE-pacing.bot_wait.easy', 'F-CODE-pacing.bot_wait.medium', 'F-CODE-pacing.bot_wait.hard'],
    alsoCite: ['F-CODE-pacing.matchmaking', 'F-GA-funnel-battle_finish', 'F-CODE-battle-params'],
    observation: 'After a wrong or imperfect submission in tech/IB bot battles, the player must wait for the bot\'s simulated finish (up to ~4 minutes on hard) with nothing to do. Matchmaking falls back to bots after 3s, so this likely affects most battles.',
    hypothesis: 'Players who finish before the bot leave during the non-interactive wait, lowering battle completion and replay.',
    intervention: 'When the human has finished, resolve the bot\'s (already simulated) result immediately and show the result screen. Outcome probabilities are unchanged.',
    primaryMetric: 'bot_battle_completion', guardrails: ['premature_exit_rate', 'next_day_return', 'client_error_rate'],
    instrumentation: ['opponent_type_mix', 'noninteractive_wait_time', 'abandonment_by_difficulty'],
    reach: 3, ease: 3,
  },
  {
    key: 'quality.ambiguous_answer_format',
    area: 'question_quality',
    title: 'Ambiguous answer format in numeric questions',
    needsAny: ['F-Q-ambiguous-format'],
    alsoCite: ['F-CODE-flags-lost', 'F-GAP-question_solve_rate', 'F-GAP-question_dispute_rate'],
    observation: 'Several numeric questions expect a rounded decimal (or a specific unit) without saying so; tolerance-based grading can then reject correct reasoning.',
    hypothesis: 'Players who get a "wrong" verdict on a correct-but-differently-formatted answer feel cheated and abandon the game or stop trusting the bank.',
    intervention: 'Show reviewed, clarified wording (explicit unit and rounding) for the flagged questions.',
    primaryMetric: 'affected_question_abandon_rate', guardrails: ['question_dispute_rate', 'game_completion_rate', 'client_error_rate'],
    instrumentation: ['question_solve_rate', 'question_dispute_rate', 'abandonment_by_difficulty'],
    reach: 2, ease: 3,
  },
  {
    key: 'pacing.quant_battle_length',
    area: 'pacing',
    title: 'Quant Battle is long and its blitz never ends early',
    needsAny: ['F-CODE-pacing.quant_battle.easy', 'F-CODE-pacing.quant_battle.hard'],
    alsoCite: ['F-GA-funnel-battle_finish', 'F-GAP-game_duration_distribution'],
    observation: 'A Quant Battle is a fixed 120s blitz followed by up to 8-12 minutes for four tactical questions (worst case 10-14 minutes).',
    hypothesis: 'The match length exceeds what casual visitors budget for, so a share leave before the result screen, especially on mobile.',
    intervention: 'Test a shorter format (e.g. 60s blitz and a 6-minute tactical cap) once duration data shows how often players run to the limit.',
    primaryMetric: 'bot_battle_completion', guardrails: ['premature_exit_rate', 'next_day_return'],
    instrumentation: ['game_duration_distribution', 'abandonment_by_difficulty'],
    reach: 2, ease: 2,
  },
  {
    key: 'quality.ib_identical_sets',
    area: 'question_quality',
    title: 'IB battles always serve the same three questions',
    needsAny: ['F-Q-ib-pool'],
    alsoCite: ['F-GA-tenure', 'F-GA-retention'],
    observation: 'Each IB tier has exactly as many questions as a match draws, so every IB match repeats the identical set.',
    hypothesis: 'Returning players see no novelty in IB battles and stop replaying them; this depresses repeat play for that segment.',
    intervention: 'Expand IB pools (at least 15 per tier) before any experiment; meanwhile, hide IB battles or label them as a fixed set.',
    primaryMetric: 'next_game_start_rate', guardrails: ['game_completion_rate'],
    instrumentation: ['opponent_type_mix', 'next_game_start_rate'],
    reach: 1, ease: 2,
  },
  {
    key: 'pacing.post_game_transition',
    area: 'pacing',
    title: 'Unclear next step after a game',
    needsAny: ['F-GAP-next_game_start_rate'],
    alsoCite: ['F-GA-funnel-battle_finish', 'F-GA-funnel-solo_finish', 'F-GA-tenure'],
    observation: 'Result screens offer several equally weighted actions (and a sign-up block for guests above them). Whether players start another game is not measured.',
    hypothesis: 'Players finish one game and leave because the next game is not the obvious, one-tap default.',
    intervention: 'After measuring post_game_action, test a single primary "Play again" CTA, with sign-up moved below for guests.',
    primaryMetric: 'next_game_start_rate', guardrails: ['next_day_return', 'premature_exit_rate'],
    instrumentation: ['next_game_start_rate'],
    reach: 3, ease: 2,
  },
  {
    key: 'measurement.quit_counted_as_complete',
    area: 'measurement',
    title: 'Completion metrics are inflated by quits',
    needsAny: ['F-CODE-quit-as-complete'],
    alsoCite: ['F-GA-funnel-solo_finish'],
    observation: 'Mental Math\'s Quit button fires game_completed.',
    hypothesis: 'The measured solo completion rate overstates true completion, hiding abandonment in solo games.',
    intervention: 'Fire game_abandoned (reason=quit) instead of game_completed on quit, then re-baseline. Not an A/B test: a measurement fix.',
    primaryMetric: null, guardrails: [],
    instrumentation: ['abandonment_by_difficulty', 'game_duration_distribution'],
    reach: 2, ease: 3,
  },
  {
    key: 'device.mobile_friction',
    area: 'device',
    title: 'Mobile friction in core game loops',
    needsPrefix: 'F-GA-devicegap-mobile',
    alsoCite: ['F-GA-device-mobile', 'F-GA-device-desktop'],
    observation: 'Funnel conversion is significantly lower on mobile than on other devices.',
    hypothesis: 'Input-heavy screens (code editor, numeric entry with live check) are harder on touch keyboards, so mobile players abandon more.',
    intervention: 'Instrument per-question first-input time on mobile; then test a numeric keypad (inputmode="decimal") and hide code battles on small screens.',
    primaryMetric: 'game_completion_rate', guardrails: ['client_error_rate'],
    instrumentation: ['time_to_first_interaction', 'abandonment_by_difficulty'],
    reach: 2, ease: 2,
  },
];

function generateRuleHypotheses(findings, priorOutcomes = {}, limit = 5) {
  const ids = new Set(findings.map(f => f.id));
  const out = [];
  for (const t of TEMPLATES) {
    const triggers = t.needsPrefix ? [...ids].filter(i => i.startsWith(t.needsPrefix)) : t.needsAny.filter(i => ids.has(i));
    if (!triggers.length) continue;
    const evidence = [...new Set([...triggers, ...t.alsoCite.filter(i => ids.has(i))])];
    // Only funnel and device-gap findings count as measured *support*; overall
    // stats like tenure or retention are context, not evidence for a mechanism.
    const measured = evidence.filter(i => i.startsWith('F-GA-funnel') || i.startsWith('F-GA-devicegap')).length;
    const prior = priorOutcomes[t.key] || [];
    const settled = prior.some(p => p.decision === 'keep' || p.decision === 'revert');
    const needsMoreData = prior.some(p => p.decision === 'inconclusive');
    const score = 2 * Math.min(measured, 2) + evidence.length + t.reach + t.ease - (settled ? 10 : 0) + (needsMoreData ? 1 : 0);
    out.push({
      id: null, key: t.key, area: t.area, title: t.title,
      observation: t.observation, hypothesis: t.hypothesis, intervention: t.intervention,
      evidence,
      causalStatus: 'untested: supported by code inspection and correlational data only',
      primaryMetric: t.primaryMetric, guardrails: t.guardrails, requiredInstrumentation: t.instrumentation,
      confidence: measured >= 1 && evidence.length >= 3 ? 'medium' : 'low',
      priorOutcomes: prior,
      score,
      source: 'rules',
    });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit).map((h, i) => ({ ...h, id: `H${i + 1}`, priority: i + 1 }));
}

module.exports = { generateRuleHypotheses, TEMPLATES };
