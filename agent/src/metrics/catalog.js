// Metric registry. Each metric declares the events/params it needs; the gap
// analysis compares that against what the codebase actually emits and what
// GA4 has registered, so "measurable" is computed, never asserted.
//
// Conventions for new instrumentation:
//   - anon_id: random UUID in localStorage `qb_anon_id`; never email/username/IP.
//   - game_session_id: random id per game instance, shared by all its events.
//   - Every new event respects analytics consent (see consent proposal).

const METRICS = [
  // ── Measurable today (GA4 built-ins + existing events) ─────────────────────
  {
    id: 'engagement_by_segment', kind: 'existing',
    name: 'Engagement rate & session duration by new vs returning and device',
    question: 'Who engages, and does friction differ across devices or new/returning users?',
    requiredEvents: [], ga4Builtin: ['sessions', 'engagedSessions', 'engagementRate', 'averageSessionDuration', 'newVsReturning', 'deviceCategory'],
    calculation: 'GA4 Data API runReport: engagedSessions / sessions, grouped by newVsReturning and deviceCategory.',
    supports: 'Large gaps between segments (e.g. mobile engagement far below desktop) point to device-specific friction.',
    contradicts: 'Similar rates across segments suggests friction is not device- or tenure-specific.',
    productUse: 'Decides whether to prioritise mobile layout fixes vs onboarding vs core-loop changes.',
    caveat: 'Session-level only. Says nothing about individual questions or games.',
  },
  {
    id: 'battle_finish_ratio', kind: 'existing',
    name: 'Battle finish ratio',
    question: 'What share of started battles reach a result screen?',
    requiredEvents: [{ event: 'battle_started', params: [] }, { event: 'battle_finished', params: [] }],
    calculation: 'users(battle_finished) / users(battle_started), and eventCount ratio, over the lookback window.',
    supports: 'A low ratio supports a pacing/abandonment problem inside battles.',
    contradicts: 'A ratio near 1 means battles are rarely abandoned mid-game.',
    productUse: 'Top-line health check for battle pacing work.',
    caveat: 'Cannot split by category, difficulty or opponent type until those params are added and registered as custom dimensions.',
  },
  {
    id: 'solo_game_finish_ratio', kind: 'existing',
    name: 'Solo game finish ratio (Mental Math + 80-in-8 combined)',
    question: 'Do players who start a solo game reach the end?',
    requiredEvents: [{ event: 'game_started', params: ['game'] }, { event: 'game_completed', params: ['game'] }],
    calculation: 'users(game_completed) / users(game_started); split by `game` only if registered as a custom dimension.',
    supports: 'Low ratio for 80-in-8 specifically would support the "too long" hypothesis (8 min fixed).',
    contradicts: 'High ratio means players tolerate the length once started.',
    productUse: 'Identifies which solo game to shorten or restructure.',
    caveat: 'Quitting through the Quit button is NOT distinguishable from closing the tab; Mental Math\'s quitGame() also fires game_completed, inflating completions.',
  },
  {
    id: 'practice_view_to_submit', kind: 'existing',
    name: 'Practice question view → submit rate',
    question: 'How often does opening a practice question lead to an attempt?',
    requiredEvents: [{ event: 'questions_viewed', params: ['question_id'] }, { event: 'question_submitted', params: ['question_id'] }],
    calculation: 'eventCount(question_submitted) / eventCount(questions_viewed), per difficulty if registered.',
    supports: 'Low conversion on specific difficulties suggests those questions look intimidating or unclear.',
    contradicts: 'Uniform conversion suggests difficulty labelling is not the issue.',
    productUse: 'Flags question pages to rewrite. Per-question rates need question_id as a custom dimension (high cardinality, so better done server-side).',
  },
  {
    id: 'next_day_return', kind: 'existing',
    name: 'Next-day-or-later return (approximate)',
    question: 'Do visitors come back on a later day?',
    requiredEvents: [{ event: 'returned_next_day', params: [] }],
    calculation: 'users(returned_next_day) / activeUsers. Prefer GA4 cohort reports (firstSessionDate cohorts, weekly).',
    supports: 'Baseline retention for comparing experiments.',
    contradicts: '',
    productUse: 'Retention guardrail.',
    caveat: 'Based on localStorage; resets with cleared storage/private mode and fires on any later day, not specifically the next one.',
  },

  // ── Proposed: needed to explain behaviour ─────────────────────────────────
  {
    id: 'time_to_first_interaction', kind: 'proposed',
    name: 'Time from question presentation to first interaction',
    question: 'Are players stalled by a question (reading, confusion) before they even start answering?',
    requiredEvents: [
      { event: 'question_presented', params: ['game_session_id', 'game', 'question_id', 'question_index', 'difficulty'] },
      { event: 'question_first_input', params: ['game_session_id', 'question_id', 'ms_since_presented'] },
    ],
    where: 'game.js (renderGame / tactical render), index.html selectProblem, games.js nextQuestion',
    calculation: 'Distribution (p50/p90) of ms_since_presented per question_id and difficulty. Server-side store preferred to avoid GA4 cardinality limits.',
    supports: 'Long p90 on specific questions with normal p50 elsewhere implicates question wording, not game length.',
    contradicts: 'Uniform times across questions of a tier suggests wording is not the bottleneck.',
    productUse: 'Ranks questions for rewrite; a candidate quality metric for EXP-002.',
  },
  {
    id: 'abandonment_by_difficulty', kind: 'proposed',
    name: 'Abandonment conditional on question difficulty and position',
    question: 'On which question (and difficulty) do players give up?',
    requiredEvents: [
      { event: 'question_presented', params: ['game_session_id', 'question_id', 'question_index', 'difficulty'] },
      { event: 'game_abandoned', params: ['game_session_id', 'game', 'phase', 'question_index', 'elapsed_ms', 'reason'] },
    ],
    where: 'game.js/mentalmath.js/games.js: quit buttons + visibilitychange/pagehide (navigator.sendBeacon via transport_type: beacon)',
    calculation: 'For each (difficulty, question_index): abandons / presentations, computed per game_session_id.',
    supports: 'Abandonment concentrated at hard questions supports a question-quality/difficulty problem.',
    contradicts: 'Abandonment rising with elapsed time regardless of difficulty supports a length/pacing problem.',
    productUse: 'Separates the two main hypotheses (pacing vs quality) - the key diagnostic.',
  },
  {
    id: 'next_game_start_rate', kind: 'proposed',
    name: 'Percentage of players starting another game',
    question: 'After finishing a game, do players immediately play again?',
    requiredEvents: [
      { event: 'game_completed', params: ['game_session_id', 'game'] },
      { event: 'post_game_action', params: ['game_session_id', 'action', 'ms_since_result'] },
      { event: 'game_started', params: ['game_session_id', 'game'] },
    ],
    where: 'game.js renderResult (rematch/backToSetup/practice), mentalmath.js + games.js result screens',
    calculation: 'Share of game_completed followed by game_started from the same anon_id within 10 minutes; plus action mix (rematch / new / practice / leave).',
    supports: 'Low rate with long ms_since_result supports a slow or unclear post-game transition.',
    contradicts: 'Fast exits regardless of result-screen design suggest session goals are met (one game per visit).',
    productUse: 'Primary metric for result-screen and rematch experiments.',
  },
  {
    id: 'noninteractive_wait_time', kind: 'proposed',
    name: 'Time spent in non-interactive transitions',
    question: 'How long do players sit waiting (matchmaking, waiting for bot, phase transitions)?',
    requiredEvents: [
      { event: 'wait_started', params: ['game_session_id', 'wait_type'] },
      { event: 'wait_ended', params: ['game_session_id', 'wait_type', 'wait_ms', 'outcome'] },
    ],
    where: 'game.js: matchmaking countdown, after submit while opponent pending, blitz→tactical transition',
    calculation: 'Sum and distribution of wait_ms per game_session_id by wait_type; share of abandonments occurring during a wait (outcome=left).',
    supports: 'Abandonment clustered in waits supports cutting dead time (e.g. ending bot battles once the player is done).',
    contradicts: 'Few departures during waits means waits are tolerated.',
    productUse: 'Primary diagnostic for EXP-001 (bot wait removal).',
  },
  {
    id: 'question_dispute_rate', kind: 'proposed',
    name: 'Question dispute rate',
    question: 'Which questions do players believe are wrong or ambiguous?',
    requiredEvents: [
      { event: 'question_flagged', params: ['question_id', 'reason', 'context'] },
      { event: 'question_presented', params: ['question_id'] },
    ],
    serverSide: 'Persist /api/flag into a question_flags table (question_id, reason, context, anon_id, created_at). Today flags are only console.log()ed and lost.',
    where: 'server/index.js /api/flag + server/db.js',
    calculation: 'flags / presentations per question_id, with a minimum of 30 presentations before ranking.',
    supports: 'High dispute rate on questions the audit flagged confirms quality problems.',
    contradicts: 'Disputes uncorrelated with audit flags means the audit heuristics need revisiting.',
    productUse: 'Feeds the quarantine list for EXP-002 and the content review queue.',
  },
  {
    id: 'game_duration_distribution', kind: 'proposed',
    name: 'Game completion time distribution',
    question: 'How long do games actually take, by type and difficulty?',
    requiredEvents: [{ event: 'game_completed', params: ['game_session_id', 'game', 'difficulty', 'duration_ms', 'end_reason'] }, { event: 'battle_finished', params: ['game_session_id', 'category', 'difficulty', 'duration_ms', 'opponent_type'] }],
    where: 'game.js game_result handler, mentalmath.js endGame, games.js endGame',
    calculation: 'p25/p50/p90 duration_ms by game × difficulty; compare against configured time limits.',
    supports: 'Durations piling up at the time limit support "games take too long / end by timeout".',
    contradicts: 'Most games ending well before the limit means length is not the binding constraint.',
    productUse: 'Sets time-limit treatments for pacing experiments.',
  },
  {
    id: 'question_solve_rate', kind: 'proposed',
    name: 'Per-question solve rate and response time',
    question: 'Is each question\'s actual difficulty consistent with its label?',
    requiredEvents: [{ event: 'question_answered', params: ['game_session_id', 'question_id', 'difficulty', 'correct', 'response_ms', 'attempts'] }],
    where: 'game.js tactical/numeric submit, index.html practice submit',
    calculation: 'Solve rate and median response_ms per question_id; flag questions whose solve rate is >2 SD from their tier mean (min 30 attempts).',
    supports: 'Easy-labelled questions with very low solve rates indicate mislabelled or flawed questions.',
    contradicts: 'Tight solve-rate bands per tier mean labels are well calibrated.',
    productUse: 'Difficulty recalibration; guardrail for content changes.',
  },
  {
    id: 'opponent_type_mix', kind: 'proposed',
    name: 'Bot vs human battle share',
    question: 'How many battles are actually against bots, and do outcomes differ?',
    requiredEvents: [{ event: 'battle_started', params: ['game_session_id', 'category', 'difficulty', 'opponent_type', 'queue_ms'] }],
    where: 'server includes opponent_type in match_found payload; game.js forwards it',
    calculation: 'Share of battle_started with opponent_type=bot; finish ratio and next-game rate split by opponent_type.',
    supports: 'If most battles are bot battles, bot pacing (simulated delays) dominates the battle experience.',
    contradicts: 'Mostly human matches would shift attention to matchmaking quality.',
    productUse: 'Scopes EXP-001 and any matchmaking work.',
  },
];

// Cross-cutting instrumentation that is a prerequisite for most proposals.
const FOUNDATIONS = [
  {
    id: 'consent_mode', title: 'Google Consent Mode v2 default-deny + banner',
    why: 'No page sets a consent default; GA4 currently loads unconditionally. New behavioural events must respect consent.',
    change: "Before gtag('config'): gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}); update to 'granted' on opt-in. trackEvent() becomes a no-op for custom behavioural events until consent is granted.",
  },
  {
    id: 'anon_id', title: 'Pseudonymous unit id for experiments',
    why: 'Experiments need consistent assignment across visits without collecting personal data.',
    change: "auth.js: const anonId = localStorage.qb_anon_id || (localStorage.qb_anon_id = crypto.randomUUID()); gtag('set','user_properties',{qb_anon_id_hash: <first 8 hex of FNV hash>}). Never send email/username. Only created after consent.",
  },
  {
    id: 'game_session_id', title: 'game_session_id on every game event',
    why: 'Without it, starts, abandons and completions cannot be joined into per-game funnels.',
    change: 'Generate crypto.randomUUID() at game start; include in all game/question events.',
  },
  {
    id: 'ga4_custom_dimensions', title: 'Register event params as GA4 custom dimensions',
    why: 'The Data API cannot group by event params until they are registered (Admin > Custom definitions). Today none appear to be registered.',
    change: 'Register: game, difficulty, category, opponent_type, phase, end_reason, wait_type, action, experiment_id, variant. Keep question_id OUT of GA4 dimensions (cardinality); send per-question data to the server instead.',
  },
  {
    id: 'server_event_store', title: 'Server-side game_events table',
    why: 'Question-level analysis needs exact, unsampled, high-cardinality data that GA4 thresholds and aggregates away.',
    change: 'SQLite table game_events(id, ts, anon_id, game_session_id, event, question_id, props JSON). POST /api/events (batched, consent-gated, rate-limited). Matches the existing better-sqlite3 stack.',
  },
  {
    id: 'experiment_exposure', title: 'experiment_exposure event',
    why: 'Analysis must count only units that actually saw the variant.',
    change: "trackEvent('experiment_exposure', { experiment_id, variant }) the first time a flagged code path runs per anon_id.",
  },
];

module.exports = { METRICS, FOUNDATIONS };
