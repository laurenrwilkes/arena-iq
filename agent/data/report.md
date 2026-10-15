# QuantBattle engagement agent: run 2026-10-15T22-39-22-788Z

Generated 2026-10-15T22:41:50.559Z. Data source: **GA4 property 546626239**. Hypotheses: **LLM (claude-opus-5-5), validated against findings**.

## 1. Current engagement (GA4)

| Segment | Users | Sessions | Engagement rate | Engaged s/user |
|---|---:|---:|---:|---:|
| All | 112 | 165 | 49.7% | 303 |
| new | 94 | 94 | 63.8% | 214 |
| returning | 18 | 36 | 58.3% | 768 |
| (not set) | 0 | 35 | 2.9% | 0 |
| desktop | 88 | 128 | 54.7% | 370 |
| mobile | 23 | 36 | 30.6% | 50 |
| tablet | 1 | 1 | 100.0% | 170 |

| Funnel | Rate | n | 95% CI |
|---|---:|---:|---|
| Battle started → finished | 55.6% | 5/9 | 26.7%–81.1% |
| Solo game started → completed | 57.1% | 4/7 | 25.0%–84.2% |
| Game card clicked → game started | 70.0% | 7/10 | 39.7%–89.2% |
| Practice question viewed → submitted | 68.3% | 399/584 | 64.4%–72.0% |
| Users playing the brain teaser | 8.0% | 9/112 | 4.3%–14.6% |
| Users creating an account | 3.6% | 4/112 | 1.4%–8.8% |
| Users returning on a later day (approx.) | 17.9% | 20/112 | 11.9%–26.0% |

**Device gaps (observational):**
- Practice question viewed → submitted: mobile 2.6% vs others 73.0%

## 2. What is measurable today

| Metric | Status | Missing |
|---|---|---|
| Engagement rate & session duration by new vs returning and device | measurable | — |
| Battle finish ratio | measurable | — |
| Solo game finish ratio (Mental Math + 80-in-8 combined) | partial | — |
| Practice question view → submit rate | partial | — |
| Next-day-or-later return (approximate) | measurable | — |
| Time from question presentation to first interaction | partial | — |
| Abandonment conditional on question difficulty and position | partial | — |
| Percentage of players starting another game | partial | — |
| Time spent in non-interactive transitions | partial | — |
| Question dispute rate | partial | — |
| Game completion time distribution | partial | — |
| Per-question solve rate and response time | partial | — |
| Bot vs human battle share | partial | — |

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

### H1. Mobile practice questions almost never lead to a submission  _(device, confidence: medium)_
- **Observation:** Practice question viewed → submitted is 2.6% on mobile vs 73.0% on other devices (difference -70.5%, 95% CI -76.7% to -64.3%). Mobile users also show lower engagement (30.6% vs 54.7% on desktop; 50 vs 370 engaged s/user). Mobile is 23 of 112 users.
- **Hypothesis:** A mobile-specific defect in the practice answer UI blocks or discourages submission. Candidates are the answer input or submit button being hidden by the on-screen keyboard, or a non-numeric keypad. Alternatively, the submit event does not fire on mobile, which would make this a tracking artefact rather than a behaviour gap. Either way, mobile practice users disengage before attempting.
- **Intervention:** Step 1: run a manual QA pass on real phones and confirm practice_question_submitted fires on mobile. Step 2: if a UI defect is confirmed, ship the minimal fix behind a mobile-only flag (e.g. inputmode=decimal on the answer field, a sticky or visible submit button) and compare mobile practice view→submit by variant.
- **Primary metric:** n/a (measurement fix); guardrails: client_error_rate
- **Causal status:** Correlational only (observational device split). Could be a real UX barrier, a tracking bug, or audience differences. No causal claim until QA plus a flagged fix is tested.
- **Evidence:** `F-GA-devicegap-mobile-practice_view_to_submit`, `F-GA-device-mobile`, `F-GA-device-desktop`, `F-GA-funnel-practice_view_to_submit`, `F-GAP-practice_view_to_submit`
- **Needs instrumentation:** practice_view_to_submit, engagement_by_segment
- **Why this rank:** Ranked 1. It has the largest and most precisely estimated gap in the data, on the highest-volume funnel. Diagnosis is cheap (QA plus checking event firing), and a fix is small and reversible. Two things temper impact: mobile is a minority of users, and the gap may be a measurement artefact. None of the allowed experiment metrics captures practice submission, so primary_metric is none until practice view→submit by device becomes an experiment metric.

### H2. Forced non-interactive wait for the bot after a wrong/non-perfect submission  _(pacing, confidence: low)_
- **Observation:** In tech/IB bot battles, after a wrong or non-perfect submission the player waits with no interaction for the bot's simulated finish: 35-85s (easy), 65-140s (medium) or 100-230s (hard) after match start. Matchmaking falls back to a bot after 3s, so most battles are likely bot battles. The battle started → finished rate is 55.6% (5/9, 95% CI 26.7%-81.1%).
- **Hypothesis:** Players who finish early and face up to minutes of dead time leave before the result screen. This lowers battle completion and the chance they start another game.
- **Intervention:** Behind a feature flag, after the player's final submission in a bot battle, offer a 'See result now' action. It fast-forwards the bot's pre-sampled simulated finish and shows the result screen immediately.
- **Primary metric:** bot_battle_completion; guardrails: next_game_start_rate, game_completion_rate, client_error_rate
- **Causal status:** The wait is a code fact; its effect on behaviour is unmeasured. Battle finish is based on 9 starts and opponent type is not recorded, so the link to abandonment is a hypothesis only.
- **Evidence:** `F-CODE-pacing.bot_wait.easy`, `F-CODE-pacing.bot_wait.medium`, `F-CODE-pacing.bot_wait.hard`, `F-CODE-pacing.matchmaking`, `F-GA-funnel-battle_finish`, `F-GAP-noninteractive_wait_time`, `F-GAP-opponent_type_mix`
- **Needs instrumentation:** noninteractive_wait_time, opponent_type_mix, battle_finish_ratio, next_game_start_rate
- **Why this rank:** Ranked 2. The friction is certain from code, it likely affects most battles (bot fallback after 3s), and the fix is a small flagged UI change. It ranks below H1 only because the behavioural evidence is very thin (n=9 battle starts) and the share of bot battles is unconfirmed.

### H3. Numeric questions without rounding/unit instructions mark correct answers wrong  _(question_quality, confidence: low)_
- **Observation:** 11 numeric questions have a 3+ decimal answer but no rounding or unit instruction (e.g. qm46, qm47, qm49, qm52). Their tolerances are tight enough that a common 2-decimal or other-unit entry can fall outside them. The audit reports 0 high-severity issues. GA4 cannot split events by question.
- **Hypothesis:** Players who answer these questions correctly at a different precision or unit (e.g. 0.57 instead of 0.5714, % instead of decimal, seconds instead of minutes) are marked wrong. This leads to frustration, disputes and abandonment on those questions.
- **Intervention:** Behind a flag, append a standardised format line to the flagged questions (e.g. 'Enter as a decimal rounded to 4 decimal places' or 'in years, to 2 d.p.'). Answers and tolerances stay unchanged.
- **Primary metric:** affected_question_solve_rate; guardrails: affected_question_abandon_rate, question_dispute_rate
- **Causal status:** A content-audit fact with no behavioural data. Session-level GA4 data cannot show question-level behaviour, so any effect on solve or abandon rates is untested.
- **Evidence:** `F-Q-ambiguous-format`, `F-Q-summary`, `F-GAP-question_solve_rate`, `F-GAP-question_dispute_rate`, `F-GAP-abandonment_by_difficulty`, `F-GAP-ga4-dims`
- **Needs instrumentation:** question_solve_rate, question_dispute_rate, abandonment_by_difficulty, time_to_first_interaction
- **Why this rank:** Ranked 3. The change is extremely cheap and reversible, and it removes a clear fairness risk. Expected impact is limited: only 11 of 279 questions are affected, and there is no behavioural evidence yet. It also needs question-level events before results can be read.

### H4. Fixed-length Quant Battle phases make matches long  _(pacing, confidence: low)_
- **Observation:** Quant Battle has a fixed 120s blitz phase that never ends early. It is followed by up to 480/600/720s for 4 tactical questions, giving a worst case of 10/12/14 min per match. No match duration is stored, and battle finish is 55.6% (5/9).
- **Hypothesis:** Players who finish blitz questions early wait out the clock. The long worst-case match length leads some to abandon mid-match or not start another battle.
- **Intervention:** Behind a flag, end the blitz phase early once the player has answered all available blitz items (or offer a 'Continue' button), leaving the tactical phase unchanged.
- **Primary metric:** game_completion_rate; guardrails: next_game_start_rate, client_error_rate
- **Causal status:** The phase lengths are a code fact. Actual game durations and where players abandon are unmeasured, so this is a hypothesis without behavioural support.
- **Evidence:** `F-CODE-pacing.quant_battle.easy`, `F-CODE-pacing.quant_battle.medium`, `F-CODE-pacing.quant_battle.hard`, `F-CODE-matches-partial`, `F-GAP-game_duration_distribution`, `F-GA-funnel-battle_finish`
- **Needs instrumentation:** game_duration_distribution, noninteractive_wait_time, battle_finish_ratio, abandonment_by_difficulty
- **Why this rank:** Ranked 4. It is plausible and the change is moderately easy. It is unclear how often players actually finish blitz early. Duration is not recorded and it overlaps with H2, which has a clearer dead-time mechanism, so it should follow H2.

### H5. Every IB battle serves the identical question set  _(retention, confidence: low)_
- **Observation:** Each IB battle pool holds 3 questions per tier and every match draws 3, so every IB match serves the same set. 8 questions also reuse titles across tiers. Week-1 retention averages 8.4% and later-day return is 17.9%.
- **Hypothesis:** Players who replay IB battles see the exact same questions. This removes novelty and challenge, so they are less likely to start another game or come back.
- **Intervention:** Behind a flag, expand each IB tier pool (e.g. by adding reviewed questions) so a match draws 3 from a larger set. Measure replay in the IB category.
- **Primary metric:** next_game_start_rate; guardrails: game_completion_rate, question_dispute_rate
- **Causal status:** The pool structure is a content fact. Retention figures are site-wide and correlational, and cannot be attributed to IB since events are not split by category. Untested.
- **Evidence:** `F-Q-ib-pool`, `F-Q-duplicates`, `F-GA-retention`, `F-GA-funnel-next_day_return`, `F-GAP-next_game_start_rate`
- **Needs instrumentation:** next_game_start_rate, opponent_type_mix, engagement_by_segment
- **Why this rank:** Ranked 5. Repetition is certain for anyone who replays IB, but the share of IB traffic is unknown. Writing and reviewing new questions costs more than a UI flag, and retention metrics are noisy at current volumes.

## 5. Proposed experiments

### EXP-001-bot-battle-instant-resolve: Resolve bot battles as soon as the player is done (proposed)
- **Hypothesis:** Removing the non-interactive wait for the bot's simulated finish (up to 85/140/230s by difficulty) will increase the share of players whose bot battles reach the result screen.
- **control:** Current behaviour: after a wrong (single-question) or imperfect (multi-question) submission, the player waits until the bot's scheduled finish time.
- **treatment:** As soon as the player has submitted their final answer, the bot's result is drawn immediately from the same accuracy distribution (BOT_ACCURACY) and the result screen is shown. Win/loss probabilities are unchanged; only the wait is removed. Quant Battle is not affected.
- **Primary metric:** bot_battle_completion (increase); baseline 60.0% (assumed (no usable measurement yet))
- **Guardrails:** premature_exit_rate (harm = increase), next_day_return (harm = decrease), client_error_rate (harm = increase)
- **Stopping rule:** mSPRT, alpha 0.05, MDE 9.0% abs; min 14 days & 167/arm; cap 665/arm or 42 days.
- **Feasibility:** At current traffic this needs ~4138 days, beyond the 42-day cap: expect "inconclusive" unless the effect is much larger than the MDE. Consider a larger MDE or running without competing experiments.
- **Prerequisites before approval:** Treatment code reviewed and merged behind the flag (default = control)
- **Code changes (already built, behind the flag):**
  - server/index.js startBotMatch: keep the bot resolution in a named function; in the treatment arm call it (and clear the pending timers) from submit_answer once the human has finished.
  - socket auth: accept anonId in handshake auth; server computes the variant with agent/src/flags/assign.js (same file served to the client as /flags.js).
  - match_found payload: include { experiment_id, variant } so the client can fire experiment_exposure once.
  - Default to control whenever the experiment is not live (unapproved, edited after approval, or missing anonId).
- **Alternative suggested by LLM (claude-opus-5-5), validated against findings:** Skip the bot wait: 'See result now' after final submission in bot battles: After the player's final submission in a bot battle, a 'See result now' button appears. It fast-forwards the bot's pre-sampled simulated finish/score and shows the result screen immediately. Bot outcomes keep the same distribution; only the waiting is removed. (not built; would need its own code and approval)

### EXP-002-clarified-answer-format: Explicit units and rounding on ambiguous numeric questions (proposed)
- **Hypothesis:** Adding explicit unit and rounding instructions to numeric questions the audit flagged as ambiguous will reduce abandonment while those questions are on screen.
- **control:** Current question text.
- **treatment:** For audit-flagged questions only, show a human-reviewed clarification (e.g. "Answer in minutes, rounded to 4 decimal places"). Answers, tolerances and all other questions are unchanged.
- **Primary metric:** affected_question_abandon_rate (decrease); baseline 12.0% (assumed (no usable measurement yet))
- **Guardrails:** question_dispute_rate (harm = increase), game_completion_rate (harm = decrease), client_error_rate (harm = increase)
- **Stopping rule:** mSPRT, alpha 0.05, MDE 2.0% abs; min 14 days & 200/arm; cap 5762/arm or 42 days.
- **Feasibility:** At current traffic this needs ~553 days, beyond the 42-day cap: expect "inconclusive" unless the effect is much larger than the MDE. Consider a larger MDE or running without competing experiments.
- **Prerequisites before approval:** Treatment code reviewed and merged behind the flag (default = control); Every clarification text reviewed and approved by a human
- **Code changes (already built, behind the flag):**
  - server/question-clarifications.js: map of question_id -> reviewed clarification text (drafted by the agent, approved by a human).
  - Serve clarified descriptions to treatment units in /api/questions and buildTacticalSet; control receives the original text.
  - question_presented carries { question_id, affected: true|false, variant } so analysis can restrict to affected questions.
  - Persist /api/flag into a question_flags table so the dispute guardrail is measurable.
- **Alternative suggested by LLM (claude-opus-5-5), validated against findings:** Explicit rounding/unit instructions on flagged numeric questions: The same questions show a standardised format line matching the stored answer's precision and unit (e.g. 'Enter as a decimal rounded to 4 decimal places', 'Enter in minutes', 'Enter as a decimal, not a percentage'). Answers and tolerances are unchanged. (not built; would need its own code and approval)

## 6. Question review queue (for human review)

| Question | Issue | Suggested clarification |
|---|---|---|
| qm79 | Possible incorrect answer. The text says each second-direction train arrives 1 minute BEFORE the next first-direction train. That leaves a 9-minute gap before each second-direction train and a 1-minute gap before each first-direction train. Under that reading the commuter would board the second direction most of the time, not with probability 0.1. The stored answer matches the opposite reading (second-direction train arrives 1 minute AFTER a first-direction train). | Human review: either change the wording to 'each one arrives exactly 1 minute after a train in the first direction' (consistent with 0.1), or re-verify the answer against the current wording. |
| qe67 | 'Best-of-3 series' conflicts with 'must win 2 sets in a row'. In a standard best-of-3, winning sets 1 and 3 would also win, which gives a different probability than the stored answer. The answer assumes the consecutive-wins rule. | Drop 'best-of-3' or reword to: 'The player plays exactly 3 sets and wins the prize only by winning two consecutive sets.' |
| qm68 | The stored answer assumes the guard chooses randomly between B and C when both are released; this assumption is not stated. If the guard always names B when possible, the answer differs. The text also says 'Enter as a decimal or fraction'; it is unclear whether the input accepts fractions, and 0.67 may fall outside the tolerance. | Add: 'If both B and C are to be released, the guard names one of them at random.' Replace the entry instruction with 'Enter as a decimal rounded to 4 decimal places' unless fraction input is supported. |
| qh2 | The hint is self-contradictory ('integer or "inf" not accepted — compute the finite closed form for finite n'). The text does not say what is paid if no 6 appears within the 20-roll cap. The stored answer appears to assume a payout of 0 in that case. | Replace the hint with: 'The game stops after at most 20 rolls; if no 6 appears in 20 rolls, the payout is $0. What is the expected payout? Round to the nearest dollar.' |
| qe72 | 'They'll be behind' is ambiguous: it could refer to the gambler or the friend. The direction of the side bet is also easy to misread, and it is not stated that breaking even (exactly one win) does not count as behind. | Reword: 'A friend bets the gambler $20 at even money that the gambler will be behind (net loss) after 36 plays; the gambler wins the $20 if not behind, and breaking even counts as not behind.' |
| qe71 | The payout wording ('1×, 2×, or 3× your stake ... for each die matching') can be read as 1× per matching die or as tiered payouts. 'Expected loss' invites sign confusion: a player may enter a negative number. | Reword: 'You are paid $1, $2 or $3 (plus your stake back) if exactly one, two or three dice match. Enter your expected loss per $1 as a positive number to 4 decimal places.' |
| qm49 | There is no rounding instruction, and the tolerance is tight enough that a correct 2-decimal entry may be marked wrong. | Append: 'Enter as a decimal rounded to 4 decimal places.' |
| qm54 | There is no rounding instruction, and the unit is not stated in the text (stored unit is minutes). A correct answer in seconds, or rounded to 2 decimals, would be marked wrong. | Append: 'Answer in minutes, as a decimal rounded to 4 decimal places.' |
| qm43 | The stored unit is %, but the text does not say whether to enter a percentage or a decimal. A decimal entry of the correct value would be marked wrong. | Append: 'Enter as a percentage (e.g. 7.5 for 7.5%).' |
| qm47 | There is no format instruction. Players may enter a percentage instead of a fraction, or round differently. | Append: 'Enter as a decimal fraction of bankroll (not a percentage), rounded to 3 decimal places.' |
| qh37 | There is no format instruction. The drift may be entered as a percentage rather than a decimal. | Append: 'Enter as a decimal (not a percentage), rounded to 3 decimal places.' |
| qh49 | There is no rounding instruction, and the tolerance may reject a correct 2-decimal entry. Players may also wonder whether a fraction is accepted. | Append: 'Enter as a decimal rounded to 4 decimal places.' |
| qm2 | 'Enter as a fraction in decimal form' is awkward, and no precision is given. A 2-decimal entry may fall outside the tolerance. | Replace with: 'Enter as a decimal rounded to 4 decimal places.' |
| qm46 | There is no rounding instruction for a 4-decimal answer in years. | Append: 'Answer in years, rounded to 4 decimal places.' |
| qm55 | There is no rounding instruction. 'Risk-free rate = 5% per period (continuous)' could be clearer about using e^(rΔt) rather than 1+r. | Reword the rate as '5% per period, continuously compounded (use e^0.05)' and append 'rounded to 4 decimal places.' |
| qh46 | The notation 'max0≤s≤1 Ws' renders without subscripts, which hurts readability. There is no rounding instruction. | Render as 'P(max over 0 ≤ s ≤ 1 of W_s ≥ 1.5)' and append 'Enter to 4 decimal places.' |
| qe48 | The tolerance is very loose relative to the answer's size (audit flag), so meaningfully wrong values may be accepted. | Human review of the tolerance; no change to the answer. Optionally state 'Enter as a decimal rounded to 4 places (e.g. 0.0123).' |

## 7. Follow-up questions

- Does practice_question_submitted fire correctly on mobile browsers? Can someone reproduce the mobile practice flow on a real phone to rule out a tracking artefact for the 2.6% figure?
- Is game_abandoned currently emitted (including on tab close or navigation), and with which parameters? The bot_battle_completion and game_completion_rate metrics depend on it.
- Is the bot's result in tech/IB battles pre-sampled at match start, or computed progressively? This determines whether 'See result now' can fast-forward safely.
- Can event parameters (game, difficulty, category, question_id, opponent_type) be registered as GA4 custom dimensions now, so question- and opponent-level metrics become measurable?
- Is there an existing UI for players to flag or dispute a question? If not, can a minimal one ship alongside the question-quality experiment?
- Does the answer input accept fractions (qm68 says 'decimal or fraction')? How are percent signs and units in the input handled?
- Can a human verify the stored answer for qm79 against its current wording before any experiment exposes it?
- Why is the overall engagement rate (49.7%) lower than both the new (63.8%) and returning (58.3%) rates? Are these computed on different bases (sessions vs users)?
- What share of battle traffic is IB versus quant/tech? This sets the priority of expanding the IB question pools.

## Appendix: findings

- `F-GA-overall` (measured) 112 active users, 165 sessions, engagement rate 49.7%.
- `F-GA-tenure` (measured) Engagement rate: new 63.8% vs returning 58.3%; engaged seconds/user 214 vs 768.
- `F-GA-device-desktop` (measured) desktop: 88 users, engagement rate 54.7%, 370 engaged s/user.
- `F-GA-device-mobile` (measured) mobile: 23 users, engagement rate 30.6%, 50 engaged s/user.
- `F-GA-device-tablet` (measured) tablet: 1 users, engagement rate 100.0%, 170 engaged s/user.
- `F-GA-funnel-battle_finish` (measured) Battle started → finished: 55.6% (5/9, 95% CI 26.7%-81.1%).
- `F-GA-funnel-solo_finish` (measured) Solo game started → completed: 57.1% (4/7, 95% CI 25.0%-84.2%).
- `F-GA-funnel-solo_click_to_start` (measured) Game card clicked → game started: 70.0% (7/10, 95% CI 39.7%-89.2%).
- `F-GA-funnel-practice_view_to_submit` (measured) Practice question viewed → submitted: 68.3% (399/584, 95% CI 64.4%-72.0%).
- `F-GA-funnel-brainteaser_play` (measured) Users playing the brain teaser: 8.0% (9/112, 95% CI 4.3%-14.6%).
- `F-GA-funnel-signup` (measured) Users creating an account: 3.6% (4/112, 95% CI 1.4%-8.8%).
- `F-GA-funnel-next_day_return` (measured) Users returning on a later day (approx.): 17.9% (20/112, 95% CI 11.9%-26.0%).
- `F-GA-funnel-new` (measured) new users: battle finish 57.1%, solo finish 50.0%.
- `F-GA-funnel-returning` (measured) returning users: battle finish 50.0%, solo finish 66.7%.
- `F-GA-devicegap-mobile-practice_view_to_submit` (measured) Practice question viewed → submitted is lower on mobile (2.6%) than other devices (73.0%); difference -70.5%, 95% CI -76.7% to -64.3%. Observational.
- `F-GA-retention` (measured) Week-1 retention across 4 weekly cohorts averages 8.4%.
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
- `F-CODE-matches-partial` (code) The matches table only records games where both players have accounts (including bots); guest games leave no server trace, and no match duration is stored.
- `F-Q-summary` (content) Question bank: 279 questions. Audit flags: duplicate_title=8, tolerance_very_loose=3, heavy_reading_for_tier=3, no_rounding_instruction=11. 0 high-severity.
- `F-Q-ambiguous-format` (content) 11 numeric questions have a 3+ decimal answer but no rounding/unit instruction (e.g. qm46, qm47, qm49, qm52); correct answers in another unit or precision may be marked wrong.
- `F-Q-duplicates` (content) 8 questions reuse another question's title across tiers (e.g. tm1, tm3, th8).
- `F-Q-ib-pool` (content) IB battle pools hold 3 questions per tier and each match draws 3: every IB match serves the identical question set.
- `F-GAP-solo_game_finish_ratio` (gap) Cannot yet measure "Solo game finish ratio (Mental Math + 80-in-8 combined)" (partial): missing .
- `F-GAP-practice_view_to_submit` (gap) Cannot yet measure "Practice question view → submit rate" (partial): missing .
- `F-GAP-time_to_first_interaction` (gap) Cannot yet measure "Time from question presentation to first interaction" (partial): missing .
- `F-GAP-abandonment_by_difficulty` (gap) Cannot yet measure "Abandonment conditional on question difficulty and position" (partial): missing .
- `F-GAP-next_game_start_rate` (gap) Cannot yet measure "Percentage of players starting another game" (partial): missing .
- `F-GAP-noninteractive_wait_time` (gap) Cannot yet measure "Time spent in non-interactive transitions" (partial): missing .
- `F-GAP-question_dispute_rate` (gap) Cannot yet measure "Question dispute rate" (partial): missing .
- `F-GAP-game_duration_distribution` (gap) Cannot yet measure "Game completion time distribution" (partial): missing .
- `F-GAP-question_solve_rate` (gap) Cannot yet measure "Per-question solve rate and response time" (partial): missing .
- `F-GAP-opponent_type_mix` (gap) Cannot yet measure "Bot vs human battle share" (partial): missing .
