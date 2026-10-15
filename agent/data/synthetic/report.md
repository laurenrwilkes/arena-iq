# QuantBattle engagement agent: run 2026-10-15T18-19-08-776Z

Generated 2026-10-15T18:19:08.797Z. Data source: **SYNTHETIC (dry run)**. Hypotheses: **rules (deterministic)**.

> **SYNTHETIC DATA.** GA4 numbers below are generated for a dry run and say nothing about real users. Set GA4_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS for real data.

## 1. Current engagement (GA4)

| Segment | Users | Sessions | Engagement rate | Engaged s/user |
|---|---:|---:|---:|---:|
| All | 2296 | 3039 | 60.0% | 137 |
| new | 1655 | 1821 | 55.4% | 137 |
| returning | 641 | 1218 | 67.0% | 139 |
| desktop | 1204 | 1605 | 68.3% | 170 |
| mobile | 997 | 1307 | 49.2% | 95 |
| tablet | 95 | 127 | 66.9% | 170 |

| Funnel | Rate | n | 95% CI |
|---|---:|---:|---|
| Battle started → finished | 56.9% | 264/464 | 52.4%–61.3% |
| Solo game started → completed | 68.4% | 286/418 | 63.8%–72.7% |
| Game card clicked → game started | 76.4% | 418/547 | 72.7%–79.8% |
| Practice question viewed → submitted | 35.6% | 419/1176 | 32.9%–38.4% |
| Users playing the brain teaser | 19.3% | 442/2296 | 17.7%–20.9% |
| Users creating an account | 4.5% | 103/2296 | 3.7%–5.4% |
| Users returning on a later day (approx.) | 9.8% | 225/2296 | 8.6%–11.1% |

**Device gaps (observational):**
- Battle started → finished: mobile 44.9% vs others 65.0%
- Practice question viewed → submitted: mobile 25.9% vs others 43.1%

## 2. What is measurable today

| Metric | Status | Missing |
|---|---|---|
| Engagement rate & session duration by new vs returning and device | measurable | — |
| Battle finish ratio | measurable | — |
| Solo game finish ratio (Mental Math + 80-in-8 combined) | partial | — |
| Practice question view → submit rate | partial | — |
| Next-day-or-later return (approximate) | measurable | — |
| Time from question presentation to first interaction | missing | question_presented[game_session_id, game, question_id, question_index, difficulty]; question_first_input[game_session_id, question_id, ms_since_presented] |
| Abandonment conditional on question difficulty and position | missing | question_presented[game_session_id, question_id, question_index, difficulty]; game_abandoned[game_session_id, game, phase, question_index, elapsed_ms, reason] |
| Percentage of players starting another game | partial | game_completed[game_session_id]; post_game_action[game_session_id, action, ms_since_result]; game_started[game_session_id] |
| Time spent in non-interactive transitions | missing | wait_started[game_session_id, wait_type]; wait_ended[game_session_id, wait_type, wait_ms, outcome] |
| Question dispute rate | missing | question_flagged[question_id, reason, context]; question_presented[question_id]; server storage |
| Game completion time distribution | partial | game_completed[game_session_id, duration_ms, end_reason]; battle_finished[game_session_id, category, difficulty, duration_ms, opponent_type] |
| Per-question solve rate and response time | missing | question_answered[game_session_id, question_id, difficulty, correct, response_ms, attempts] |
| Bot vs human battle share | partial | battle_started[game_session_id, category, difficulty, opponent_type, queue_ms] |

## 3. Proposed instrumentation

**Foundations (do first):**
- **Google Consent Mode v2 default-deny + banner**: No page sets a consent default; GA4 currently loads unconditionally. New behavioural events must respect consent.
  - Before gtag('config'): gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}); update to 'granted' on opt-in. trackEvent() becomes a no-op for custom behavioural events until consent is granted.
- **Pseudonymous unit id for experiments**: Experiments need consistent assignment across visits without collecting personal data.
  - auth.js: const anonId = localStorage.qb_anon_id || (localStorage.qb_anon_id = crypto.randomUUID()); gtag('set','user_properties',{qb_anon_id_hash: <first 8 hex of FNV hash>}). Never send email/username. Only created after consent.
- **game_session_id on every game event**: Without it, starts, abandons and completions cannot be joined into per-game funnels.
  - Generate crypto.randomUUID() at game start; include in all game/question events.
- **Register event params as GA4 custom dimensions**: The Data API cannot group by event params until they are registered (Admin > Custom definitions). Today none appear to be registered.
  - Register: game, difficulty, category, opponent_type, phase, end_reason, wait_type, action, experiment_id, variant. Keep question_id OUT of GA4 dimensions (cardinality); send per-question data to the server instead.
- **Server-side game_events table**: Question-level analysis needs exact, unsampled, high-cardinality data that GA4 thresholds and aggregates away.
  - SQLite table game_events(id, ts, anon_id, game_session_id, event, question_id, props JSON). POST /api/events (batched, consent-gated, rate-limited). Matches the existing better-sqlite3 stack.
- **experiment_exposure event**: Analysis must count only units that actually saw the variant.
  - trackEvent('experiment_exposure', { experiment_id, variant }) the first time a flagged code path runs per anon_id.

**Events:**

| Event | Action | Params | Unlocks | Where |
|---|---|---|---|---|
| `question_presented` | new_event | difficulty, game, game_session_id, question_id, question_index | time_to_first_interaction, abandonment_by_difficulty, question_dispute_rate | game.js (renderGame / tactical render), index.html selectProblem, games.js nextQuestion; game.js/mentalmath.js/games.js: quit buttons + visibilitychange/pagehide (navigator.sendBeacon via transport_type: beacon); server/index.js /api/flag + server/db.js |
| `game_completed` | add_params | duration_ms, end_reason, game_session_id | next_game_start_rate, game_duration_distribution | game.js renderResult (rematch/backToSetup/practice), mentalmath.js + games.js result screens; game.js game_result handler, mentalmath.js endGame, games.js endGame |
| `question_first_input` | new_event | game_session_id, ms_since_presented, question_id | time_to_first_interaction | game.js (renderGame / tactical render), index.html selectProblem, games.js nextQuestion |
| `game_abandoned` | new_event | elapsed_ms, game, game_session_id, phase, question_index, reason | abandonment_by_difficulty | game.js/mentalmath.js/games.js: quit buttons + visibilitychange/pagehide (navigator.sendBeacon via transport_type: beacon) |
| `post_game_action` | new_event | action, game_session_id, ms_since_result | next_game_start_rate | game.js renderResult (rematch/backToSetup/practice), mentalmath.js + games.js result screens |
| `game_started` | add_params | game_session_id | next_game_start_rate | game.js renderResult (rematch/backToSetup/practice), mentalmath.js + games.js result screens |
| `wait_started` | new_event | game_session_id, wait_type | noninteractive_wait_time | game.js: matchmaking countdown, after submit while opponent pending, blitz→tactical transition |
| `wait_ended` | new_event | game_session_id, outcome, wait_ms, wait_type | noninteractive_wait_time | game.js: matchmaking countdown, after submit while opponent pending, blitz→tactical transition |
| `question_flagged` | new_event | context, question_id, reason | question_dispute_rate | server/index.js /api/flag + server/db.js |
| `battle_finished` | add_params | category, difficulty, duration_ms, game_session_id, opponent_type | game_duration_distribution | game.js game_result handler, mentalmath.js endGame, games.js endGame |
| `question_answered` | new_event | attempts, correct, difficulty, game_session_id, question_id, response_ms | question_solve_rate | game.js tactical/numeric submit, index.html practice submit |
| `battle_started` | add_params | category, difficulty, game_session_id, opponent_type, queue_ms | opponent_type_mix | server includes opponent_type in match_found payload; game.js forwards it |

**Server:**
- (question_dispute_rate) Persist /api/flag into a question_flags table (question_id, reason, context, anon_id, created_at). Today flags are only console.log()ed and lost.

## 4. Prioritised hypotheses

### H1. Dead waiting time in bot battles  _(pacing, confidence: medium)_
- **Observation:** After a wrong or imperfect submission in tech/IB bot battles, the player must wait for the bot's simulated finish (up to ~4 minutes on hard) with nothing to do. Matchmaking falls back to bots after 3s, so this likely affects most battles.
- **Hypothesis:** Players who finish before the bot leave during the non-interactive wait, lowering battle completion and replay.
- **Intervention:** When the human has finished, resolve the bot's (already simulated) result immediately and show the result screen. Outcome probabilities are unchanged.
- **Primary metric:** bot_battle_completion; guardrails: premature_exit_rate, next_day_return, client_error_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-CODE-pacing.bot_wait.easy`, `F-CODE-pacing.bot_wait.medium`, `F-CODE-pacing.bot_wait.hard`, `F-CODE-pacing.matchmaking`, `F-GA-funnel-battle_finish`, `F-CODE-battle-params`
- **Needs instrumentation:** opponent_type_mix, noninteractive_wait_time, abandonment_by_difficulty

### H2. Unclear next step after a game  _(pacing, confidence: medium)_
- **Observation:** Result screens offer several equally weighted actions (and a sign-up block for guests above them). Whether players start another game is not measured.
- **Hypothesis:** Players finish one game and leave because the next game is not the obvious, one-tap default.
- **Intervention:** After measuring post_game_action, test a single primary "Play again" CTA, with sign-up moved below for guests.
- **Primary metric:** next_game_start_rate; guardrails: next_day_return, premature_exit_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-GAP-next_game_start_rate`, `F-GA-funnel-battle_finish`, `F-GA-funnel-solo_finish`, `F-GA-tenure`
- **Needs instrumentation:** next_game_start_rate

### H3. Mobile friction in core game loops  _(device, confidence: medium)_
- **Observation:** Funnel conversion is significantly lower on mobile than on other devices.
- **Hypothesis:** Input-heavy screens (code editor, numeric entry with live check) are harder on touch keyboards, so mobile players abandon more.
- **Intervention:** Instrument per-question first-input time on mobile; then test a numeric keypad (inputmode="decimal") and hide code battles on small screens.
- **Primary metric:** game_completion_rate; guardrails: client_error_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-GA-devicegap-mobile-battle_finish`, `F-GA-devicegap-mobile-practice_view_to_submit`, `F-GA-device-mobile`, `F-GA-device-desktop`
- **Needs instrumentation:** time_to_first_interaction, abandonment_by_difficulty

### H4. Quant Battle is long and its blitz never ends early  _(pacing, confidence: medium)_
- **Observation:** A Quant Battle is a fixed 120s blitz followed by up to 8-12 minutes for four tactical questions (worst case 10-14 minutes).
- **Hypothesis:** The match length exceeds what casual visitors budget for, so a share leave before the result screen, especially on mobile.
- **Intervention:** Test a shorter format (e.g. 60s blitz and a 6-minute tactical cap) once duration data shows how often players run to the limit.
- **Primary metric:** bot_battle_completion; guardrails: premature_exit_rate, next_day_return
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-CODE-pacing.quant_battle.easy`, `F-CODE-pacing.quant_battle.hard`, `F-GA-funnel-battle_finish`, `F-GAP-game_duration_distribution`
- **Needs instrumentation:** game_duration_distribution, abandonment_by_difficulty

### H5. Ambiguous answer format in numeric questions  _(question_quality, confidence: low)_
- **Observation:** Several numeric questions expect a rounded decimal (or a specific unit) without saying so; tolerance-based grading can then reject correct reasoning.
- **Hypothesis:** Players who get a "wrong" verdict on a correct-but-differently-formatted answer feel cheated and abandon the game or stop trusting the bank.
- **Intervention:** Show reviewed, clarified wording (explicit unit and rounding) for the flagged questions.
- **Primary metric:** affected_question_abandon_rate; guardrails: question_dispute_rate, game_completion_rate, client_error_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-Q-ambiguous-format`, `F-CODE-flags-lost`, `F-GAP-question_solve_rate`, `F-GAP-question_dispute_rate`
- **Needs instrumentation:** question_solve_rate, question_dispute_rate, abandonment_by_difficulty

## 5. Proposed experiments

### EXP-001-bot-battle-instant-resolve: Resolve bot battles as soon as the player is done (proposed)
- **Hypothesis:** Removing the non-interactive wait for the bot's simulated finish (up to 85/140/230s by difficulty) will increase the share of players whose bot battles reach the result screen.
- **control:** Current behaviour: after a wrong (single-question) or imperfect (multi-question) submission, the player waits until the bot's scheduled finish time.
- **treatment:** As soon as the player has submitted their final answer, the bot's result is drawn immediately from the same accuracy distribution (BOT_ACCURACY) and the result screen is shown. Win/loss probabilities are unchanged; only the wait is removed. Quant Battle is not affected.
- **Primary metric:** bot_battle_completion (increase); baseline 60.0% (assumed (no usable measurement yet))
- **Guardrails:** premature_exit_rate (harm = increase), next_day_return (harm = decrease), client_error_rate (harm = increase)
- **Stopping rule:** mSPRT, alpha 0.05, MDE 9.0% abs; min 14 days & 167/arm; cap 665/arm or 42 days.
- **Feasibility:** Unknown until GA4 traffic is available.
- **Prerequisites before approval:** Metric "Bot vs human battle share" is measurable (instrumentation shipped and verified); Metric "Abandonment conditional on question difficulty and position" is measurable (instrumentation shipped and verified); Pseudonymous qb_anon_id assigned after consent; Consent Mode default-deny in place; experiment events only fire with analytics consent; experiment_exposure event emitted with experiment_id and variant; Treatment code reviewed and merged behind the flag (default = control)
- **Code changes:**
  - server/index.js startBotMatch: keep the bot resolution in a named function; in the treatment arm call it (and clear the pending timers) from submit_answer once the human has finished.
  - socket auth: accept anonId in handshake auth; server computes the variant with agent/src/flags/assign.js (same file served to the client as /flags.js).
  - match_found payload: include { experiment_id, variant } so the client can fire experiment_exposure once.
  - Default to control whenever the experiment is not live (unapproved, edited after approval, or missing anonId).

### EXP-002-clarified-answer-format: Explicit units and rounding on ambiguous numeric questions (proposed)
- **Hypothesis:** Adding explicit unit and rounding instructions to numeric questions the audit flagged as ambiguous will reduce abandonment while those questions are on screen.
- **control:** Current question text.
- **treatment:** For audit-flagged questions only, show a human-reviewed clarification (e.g. "Answer in minutes, rounded to 4 decimal places"). Answers, tolerances and all other questions are unchanged.
- **Primary metric:** affected_question_abandon_rate (decrease); baseline 12.0% (assumed (no usable measurement yet))
- **Guardrails:** question_dispute_rate (harm = increase), game_completion_rate (harm = decrease), client_error_rate (harm = increase)
- **Stopping rule:** mSPRT, alpha 0.05, MDE 2.0% abs; min 14 days & 200/arm; cap 5762/arm or 42 days.
- **Feasibility:** Unknown until GA4 traffic is available.
- **Prerequisites before approval:** Metric "Abandonment conditional on question difficulty and position" is measurable (instrumentation shipped and verified); Metric "Question dispute rate" is measurable (instrumentation shipped and verified); Pseudonymous qb_anon_id assigned after consent; Consent Mode default-deny in place; experiment events only fire with analytics consent; experiment_exposure event emitted with experiment_id and variant; Treatment code reviewed and merged behind the flag (default = control); Every clarification text reviewed and approved by a human
- **Code changes:**
  - server/question-clarifications.js: map of question_id -> reviewed clarification text (drafted by the agent, approved by a human).
  - Serve clarified descriptions to treatment units in /api/questions and buildTacticalSet; control receives the original text.
  - question_presented carries { question_id, affected: true|false, variant } so analysis can restrict to affected questions.
  - Persist /api/flag into a question_flags table so the dispute guardrail is measurable.

## 6. Question audit

25 of 279 questions flagged: duplicate_title (8), tolerance_very_loose (3), heavy_reading_for_tier (3), no_rounding_instruction (11).

## 7. Follow-up questions

- Once instrumented: No event parameters are registered as GA4 custom dimensions, so no event can be split by game, difficulty or category in the Data API.
- Once instrumented: measure "Solo game finish ratio (Mental Math + 80-in-8 combined)" (partial): missing .
- Once instrumented: measure "Practice question view → submit rate" (partial): missing .
- Once instrumented: measure "Time from question presentation to first interaction" (missing): missing question_presented[game_session_id,game,question_id,question_index,difficulty]; question_first_input[game_session_id,question_id,ms_since_presented].
- Once instrumented: measure "Abandonment conditional on question difficulty and position" (missing): missing question_presented[game_session_id,question_id,question_index,difficulty]; game_abandoned[game_session_id,game,phase,question_index,elapsed_ms,reason].

## Appendix: findings

- `F-GA-overall` (measured) 2296 active users, 3039 sessions, engagement rate 60.0%. [SYNTHETIC DATA]
- `F-GA-tenure` (measured) Engagement rate: new 55.4% vs returning 67.0%; engaged seconds/user 137 vs 139. [SYNTHETIC DATA]
- `F-GA-device-desktop` (measured) desktop: 1204 users, engagement rate 68.3%, 170 engaged s/user. [SYNTHETIC DATA]
- `F-GA-device-mobile` (measured) mobile: 997 users, engagement rate 49.2%, 95 engaged s/user. [SYNTHETIC DATA]
- `F-GA-device-tablet` (measured) tablet: 95 users, engagement rate 66.9%, 170 engaged s/user. [SYNTHETIC DATA]
- `F-GA-funnel-battle_finish` (measured) Battle started → finished: 56.9% (264/464, 95% CI 52.4%-61.3%). [SYNTHETIC DATA]
- `F-GA-funnel-solo_finish` (measured) Solo game started → completed: 68.4% (286/418, 95% CI 63.8%-72.7%). [SYNTHETIC DATA]
- `F-GA-funnel-solo_click_to_start` (measured) Game card clicked → game started: 76.4% (418/547, 95% CI 72.7%-79.8%). [SYNTHETIC DATA]
- `F-GA-funnel-practice_view_to_submit` (measured) Practice question viewed → submitted: 35.6% (419/1176, 95% CI 32.9%-38.4%). [SYNTHETIC DATA]
- `F-GA-funnel-brainteaser_play` (measured) Users playing the brain teaser: 19.3% (442/2296, 95% CI 17.7%-20.9%). [SYNTHETIC DATA]
- `F-GA-funnel-signup` (measured) Users creating an account: 4.5% (103/2296, 95% CI 3.7%-5.4%). [SYNTHETIC DATA]
- `F-GA-funnel-next_day_return` (measured) Users returning on a later day (approx.): 9.8% (225/2296, 95% CI 8.6%-11.1%). [SYNTHETIC DATA]
- `F-GA-funnel-new` (measured) new users: battle finish 54.2%, solo finish 71.1%. [SYNTHETIC DATA]
- `F-GA-funnel-returning` (measured) returning users: battle finish 62.3%, solo finish 63.5%. [SYNTHETIC DATA]
- `F-GA-devicegap-mobile-battle_finish` (measured) Battle started → finished is lower on mobile (44.9%) than other devices (65.0%); difference -20.1%, 95% CI -29.1% to -11.0%. Observational. [SYNTHETIC DATA]
- `F-GA-devicegap-mobile-practice_view_to_submit` (measured) Practice question viewed → submitted is lower on mobile (25.9%) than other devices (43.1%); difference -17.2%, 95% CI -22.6% to -11.9%. Observational. [SYNTHETIC DATA]
- `F-GA-retention` (measured) Week-1 retention across 4 weekly cohorts averages 11.0%. [SYNTHETIC DATA]
- `F-GAP-ga4-dims` (gap) No event parameters are registered as GA4 custom dimensions, so no event can be split by game, difficulty or category in the Data API.
- `F-CODE-pacing.quant_battle.easy` (code) Quant Battle (easy): fixed 120s blitz phase that never ends early, then up to 480s for 4 tactical questions; worst case 10 min per match.
- `F-CODE-pacing.quant_battle.medium` (code) Quant Battle (medium): fixed 120s blitz phase that never ends early, then up to 600s for 4 tactical questions; worst case 12 min per match.
- `F-CODE-pacing.quant_battle.hard` (code) Quant Battle (hard): fixed 120s blitz phase that never ends early, then up to 720s for 4 tactical questions; worst case 14 min per match.
- `F-CODE-pacing.bot_wait.easy` (code) Bot battles (easy, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly 35-85s after match start, with no interaction available.
- `F-CODE-pacing.bot_wait.medium` (code) Bot battles (medium, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly 65-140s after match start, with no interaction available.
- `F-CODE-pacing.bot_wait.hard` (code) Bot battles (hard, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly 100-230s after match start, with no interaction available.
- `F-CODE-pacing.matchmaking` (code) Matchmaking falls back to a bot after 3s, so most battles are likely against bots. battle_started does not record opponent type, so GA4 cannot confirm this.
- `F-CODE-pacing.mental_math` (code) Mental Math Challenge: fixed 120s round.
- `F-CODE-pacing.optiver_80_in_8` (code) Optiver 80-in-8: 80 questions in 8 min; the run only ends at the timer or after the final question.
- `F-CODE-consent` (code) GA4 loads on every page without a Consent Mode default; there is no consent banner.
- `F-CODE-flags-lost` (code) Question flags (/api/flag) are console.log()ed only and never stored, so dispute rates cannot be computed.
- `F-CODE-matches-partial` (code) The matches table only records games where both players have accounts (including bots); guest games leave no server trace, and no match duration is stored.
- `F-CODE-quit-as-complete` (code) Mental Math's Quit button calls endGame(), which fires game_completed: quits are counted as completions.
- `F-CODE-battle-params` (code) battle_started only carries [is_quant_battle]: no category, difficulty, opponent type or queue time.
- `F-Q-summary` (content) Question bank: 279 questions. Audit flags: duplicate_title=8, tolerance_very_loose=3, heavy_reading_for_tier=3, no_rounding_instruction=11. 0 high-severity.
- `F-Q-ambiguous-format` (content) 11 numeric questions have a 3+ decimal answer but no rounding/unit instruction (e.g. qm46, qm47, qm49, qm52); correct answers in another unit or precision may be marked wrong.
- `F-Q-duplicates` (content) 8 questions reuse another question's title across tiers (e.g. tm1, tm3, th8).
- `F-Q-ib-pool` (content) IB battle pools hold 3 questions per tier and each match draws 3: every IB match serves the identical question set.
- `F-GAP-solo_game_finish_ratio` (gap) Cannot yet measure "Solo game finish ratio (Mental Math + 80-in-8 combined)" (partial): missing .
- `F-GAP-practice_view_to_submit` (gap) Cannot yet measure "Practice question view → submit rate" (partial): missing .
- `F-GAP-time_to_first_interaction` (gap) Cannot yet measure "Time from question presentation to first interaction" (missing): missing question_presented[game_session_id,game,question_id,question_index,difficulty]; question_first_input[game_session_id,question_id,ms_since_presented].
- `F-GAP-abandonment_by_difficulty` (gap) Cannot yet measure "Abandonment conditional on question difficulty and position" (missing): missing question_presented[game_session_id,question_id,question_index,difficulty]; game_abandoned[game_session_id,game,phase,question_index,elapsed_ms,reason].
- `F-GAP-next_game_start_rate` (gap) Cannot yet measure "Percentage of players starting another game" (partial): missing game_completed[game_session_id]; post_game_action[game_session_id,action,ms_since_result]; game_started[game_session_id].
- `F-GAP-noninteractive_wait_time` (gap) Cannot yet measure "Time spent in non-interactive transitions" (missing): missing wait_started[game_session_id,wait_type]; wait_ended[game_session_id,wait_type,wait_ms,outcome].
- `F-GAP-question_dispute_rate` (gap) Cannot yet measure "Question dispute rate" (missing): missing question_flagged[question_id,reason,context]; question_presented[question_id]; server-side storage.
- `F-GAP-game_duration_distribution` (gap) Cannot yet measure "Game completion time distribution" (partial): missing game_completed[game_session_id,duration_ms,end_reason]; battle_finished[game_session_id,category,difficulty,duration_ms,opponent_type].
- `F-GAP-question_solve_rate` (gap) Cannot yet measure "Per-question solve rate and response time" (missing): missing question_answered[game_session_id,question_id,difficulty,correct,response_ms,attempts].
- `F-GAP-opponent_type_mix` (gap) Cannot yet measure "Bot vs human battle share" (partial): missing battle_started[game_session_id,category,difficulty,opponent_type,queue_ms].
