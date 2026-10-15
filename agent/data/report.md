# QuantBattle engagement agent: run 2026-10-15T18-36-42-015Z

Generated 2026-10-15T18:36:42.040Z. Data source: **none (code-only run, GA4 skipped)**. Hypotheses: **rules (deterministic)**.

> No GA4 data in this run (code-only). Traffic tables are empty, not zero.

## 1. Current engagement (GA4)

| Segment | Users | Sessions | Engagement rate | Engaged s/user |
|---|---:|---:|---:|---:|
| All | 0 | 0 | n/a | 0 |

| Funnel | Rate | n | 95% CI |
|---|---:|---:|---|
| Battle started → finished | n/a | 0/0 | n/a–n/a |
| Solo game started → completed | n/a | 0/0 | n/a–n/a |
| Game card clicked → game started | n/a | 0/0 | n/a–n/a |
| Practice question viewed → submitted | n/a | 0/0 | n/a–n/a |
| Users playing the brain teaser | n/a | 0/0 | n/a–n/a |
| Users creating an account | n/a | 0/0 | n/a–n/a |
| Users returning on a later day (approx.) | n/a | 0/0 | n/a–n/a |

GA4 report errors: {"ga4":"skipped (--no-ga4)"}

## 2. What is measurable today

| Metric | Status | Missing |
|---|---|---|
| Engagement rate & session duration by new vs returning and device | measurable | — |
| Battle finish ratio | measurable | — |
| Solo game finish ratio (Mental Math + 80-in-8 combined) | measurable | — |
| Practice question view → submit rate | measurable | — |
| Next-day-or-later return (approximate) | measurable | — |
| Time from question presentation to first interaction | measurable | — |
| Abandonment conditional on question difficulty and position | measurable | — |
| Percentage of players starting another game | measurable | — |
| Time spent in non-interactive transitions | measurable | — |
| Question dispute rate | measurable | — |
| Game completion time distribution | measurable | — |
| Per-question solve rate and response time | measurable | — |
| Bot vs human battle share | measurable | — |

## 3. Proposed instrumentation

**Foundations (do first):**
- ~~**Google Consent Mode v2 default-deny + banner**~~ (done): No page sets a consent default; GA4 currently loads unconditionally. New behavioural events must respect consent.
  - Before gtag('config'): gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}); update to 'granted' on opt-in. trackEvent() becomes a no-op for custom behavioural events until consent is granted.
- ~~**Pseudonymous unit id for experiments**~~ (done): Experiments need consistent assignment across visits without collecting personal data.
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

## 4. Prioritised hypotheses

### H1. Dead waiting time in bot battles  _(pacing, confidence: low)_
- **Observation:** After a wrong or imperfect submission in tech/IB bot battles, the player must wait for the bot's simulated finish (up to ~4 minutes on hard) with nothing to do. Matchmaking falls back to bots after 3s, so this likely affects most battles.
- **Hypothesis:** Players who finish before the bot leave during the non-interactive wait, lowering battle completion and replay.
- **Intervention:** When the human has finished, resolve the bot's (already simulated) result immediately and show the result screen. Outcome probabilities are unchanged.
- **Primary metric:** bot_battle_completion; guardrails: premature_exit_rate, next_day_return, client_error_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-CODE-pacing.bot_wait.easy`, `F-CODE-pacing.bot_wait.medium`, `F-CODE-pacing.bot_wait.hard`, `F-CODE-pacing.matchmaking`, `F-CODE-battle-params`
- **Needs instrumentation:** opponent_type_mix, noninteractive_wait_time, abandonment_by_difficulty

### H2. Ambiguous answer format in numeric questions  _(question_quality, confidence: low)_
- **Observation:** Several numeric questions expect a rounded decimal (or a specific unit) without saying so; tolerance-based grading can then reject correct reasoning.
- **Hypothesis:** Players who get a "wrong" verdict on a correct-but-differently-formatted answer feel cheated and abandon the game or stop trusting the bank.
- **Intervention:** Show reviewed, clarified wording (explicit unit and rounding) for the flagged questions.
- **Primary metric:** affected_question_abandon_rate; guardrails: question_dispute_rate, game_completion_rate, client_error_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-Q-ambiguous-format`
- **Needs instrumentation:** question_solve_rate, question_dispute_rate, abandonment_by_difficulty

### H3. Quant Battle is long and its blitz never ends early  _(pacing, confidence: low)_
- **Observation:** A Quant Battle is a fixed 120s blitz followed by up to 8-12 minutes for four tactical questions (worst case 10-14 minutes).
- **Hypothesis:** The match length exceeds what casual visitors budget for, so a share leave before the result screen, especially on mobile.
- **Intervention:** Test a shorter format (e.g. 60s blitz and a 6-minute tactical cap) once duration data shows how often players run to the limit.
- **Primary metric:** bot_battle_completion; guardrails: premature_exit_rate, next_day_return
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-CODE-pacing.quant_battle.easy`, `F-CODE-pacing.quant_battle.hard`
- **Needs instrumentation:** game_duration_distribution, abandonment_by_difficulty

### H4. IB battles always serve the same three questions  _(question_quality, confidence: low)_
- **Observation:** Each IB tier has exactly as many questions as a match draws, so every IB match repeats the identical set.
- **Hypothesis:** Returning players see no novelty in IB battles and stop replaying them; this depresses repeat play for that segment.
- **Intervention:** Expand IB pools (at least 15 per tier) before any experiment; meanwhile, hide IB battles or label them as a fixed set.
- **Primary metric:** next_game_start_rate; guardrails: game_completion_rate
- **Causal status:** untested: supported by code inspection and correlational data only
- **Evidence:** `F-Q-ib-pool`
- **Needs instrumentation:** opponent_type_mix, next_game_start_rate

## 5. Proposed experiments

### EXP-001-bot-battle-instant-resolve: Resolve bot battles as soon as the player is done (proposed)
- **Hypothesis:** Removing the non-interactive wait for the bot's simulated finish (up to 85/140/230s by difficulty) will increase the share of players whose bot battles reach the result screen.
- **control:** Current behaviour: after a wrong (single-question) or imperfect (multi-question) submission, the player waits until the bot's scheduled finish time.
- **treatment:** As soon as the player has submitted their final answer, the bot's result is drawn immediately from the same accuracy distribution (BOT_ACCURACY) and the result screen is shown. Win/loss probabilities are unchanged; only the wait is removed. Quant Battle is not affected.
- **Primary metric:** bot_battle_completion (increase); baseline 60.0% (assumed (no usable measurement yet))
- **Guardrails:** premature_exit_rate (harm = increase), next_day_return (harm = decrease), client_error_rate (harm = increase)
- **Stopping rule:** mSPRT, alpha 0.05, MDE 9.0% abs; min 14 days & 167/arm; cap 665/arm or 42 days.
- **Feasibility:** Unknown until GA4 traffic is available.
- **Prerequisites before approval:** Treatment code reviewed and merged behind the flag (default = control)
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
- **Prerequisites before approval:** Treatment code reviewed and merged behind the flag (default = control); Every clarification text reviewed and approved by a human
- **Code changes:**
  - server/question-clarifications.js: map of question_id -> reviewed clarification text (drafted by the agent, approved by a human).
  - Serve clarified descriptions to treatment units in /api/questions and buildTacticalSet; control receives the original text.
  - question_presented carries { question_id, affected: true|false, variant } so analysis can restrict to affected questions.
  - Persist /api/flag into a question_flags table so the dispute guardrail is measurable.

## 6. Question audit

25 of 279 questions flagged: duplicate_title (8), tolerance_very_loose (3), heavy_reading_for_tier (3), no_rounding_instruction (11).

## Appendix: findings

- `F-CODE-pacing.quant_battle.easy` (code) Quant Battle (easy): fixed 120s blitz phase that never ends early, then up to 480s for 4 tactical questions; worst case 10 min per match.
- `F-CODE-pacing.quant_battle.medium` (code) Quant Battle (medium): fixed 120s blitz phase that never ends early, then up to 600s for 4 tactical questions; worst case 12 min per match.
- `F-CODE-pacing.quant_battle.hard` (code) Quant Battle (hard): fixed 120s blitz phase that never ends early, then up to 720s for 4 tactical questions; worst case 14 min per match.
- `F-CODE-pacing.bot_wait.easy` (code) Bot battles (easy, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly 35-85s after match start, with no interaction available.
- `F-CODE-pacing.bot_wait.medium` (code) Bot battles (medium, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly 65-140s after match start, with no interaction available.
- `F-CODE-pacing.bot_wait.hard` (code) Bot battles (hard, tech/IB): after a wrong or non-perfect submission the player waits for the bot's simulated finish, uniformly 100-230s after match start, with no interaction available.
- `F-CODE-pacing.matchmaking` (code) Matchmaking falls back to a bot after 3s, so most battles are likely against bots. battle_started does not record opponent type, so GA4 cannot confirm this.
- `F-CODE-pacing.mental_math` (code) Mental Math Challenge: fixed 120s round.
- `F-CODE-pacing.optiver_80_in_8` (code) Optiver 80-in-8: 80 questions in 8 min; the run only ends at the timer or after the final question.
- `F-CODE-matches-partial` (code) The matches table only records games where both players have accounts (including bots); guest games leave no server trace, and no match duration is stored.
- `F-CODE-battle-params` (code) battle_started only carries [category, difficulty, game_session_id, is_quant_battle, opponent_type, queueStartedAt, queue_ms]: no category, difficulty, opponent type or queue time.
- `F-Q-summary` (content) Question bank: 279 questions. Audit flags: duplicate_title=8, tolerance_very_loose=3, heavy_reading_for_tier=3, no_rounding_instruction=11. 0 high-severity.
- `F-Q-ambiguous-format` (content) 11 numeric questions have a 3+ decimal answer but no rounding/unit instruction (e.g. qm46, qm47, qm49, qm52); correct answers in another unit or precision may be marked wrong.
- `F-Q-duplicates` (content) 8 questions reuse another question's title across tiers (e.g. tm1, tm3, th8).
- `F-Q-ib-pool` (content) IB battle pools hold 3 questions per tier and each match draws 3: every IB match serves the identical question set.
