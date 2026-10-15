# QuantBattle engagement agent

Reads GA4, inspects this repo, finds which engagement metrics are missing, proposes instrumentation, ranks hypotheses, and designs A/B experiments that need a human to approve them. Claude proposes hypotheses and changes. Every metric and statistic is computed by deterministic code.

## Setup

```bash
cd agent && npm install
npm test          # 26 tests
npm run demo      # offline dry run on SYNTHETIC data, no LLM -> data/synthetic/
```

Real run:

```bash
export GA4_PROPERTY_ID=123456789                       # GA4 Admin > Property details
export GOOGLE_APPLICATION_CREDENTIALS=/path/sa.json    # service account with the Viewer role on the property
export ANTHROPIC_API_KEY=...                           # optional; without it, use --no-llm
node bin/qb-agent.js run            # or --no-ga4 for a code-only run
```

This writes `data/report.md`, `data/dashboard.html`, appends to `data/history.jsonl`, and saves proposed experiments to `experiments/`.

## Experiment lifecycle

```bash
node bin/qb-agent.js list
node bin/qb-agent.js approve EXP-001 --by "Lauren" --attest review:code   # refused while instrumentation is missing
node bin/qb-agent.js start EXP-001                     # commit + deploy: live once the server restarts
QB_ADMIN_KEY=... node bin/qb-agent.js analyze EXP-001 --server https://www.quantbattle.net
node bin/qb-agent.js conclude EXP-001 keep --by "Lauren" --note "..."
```

- Variants are assigned by hashing a pseudonymous `qb_anon_id` (`src/flags/assign.js`, works in both browser and server).
- An experiment serves treatment only while it is `running` and its spec still matches the hash recorded at approval. Editing it after approval switches it back to control until it is re-approved.
- Monitoring uses mSPRT always-valid p-values, so checking results every day doesn't inflate false positives (`test/stats.test.js` simulates this). There is also a sample-ratio-mismatch check, guardrail harm checks at every look, a minimum runtime before the primary metric is interpreted, and a cap after which the result is "inconclusive".
- The agent only *recommends* keep, revert or inconclusive. A human records the final decision with `conclude`.

## Where the data lives

- GA4: page/funnel events, as before (respecting Consent Mode).
- Server `game_events` table: question-level, wait, abandonment and experiment events from `analytics.js` (only with analytics consent; pseudonymous `qb_anon_id`; pruned after 180 days). `question_flags` stores player flags.
- `GET /api/admin/experiments/:id/snapshot?key=ADMIN_KEY` turns those events into the per-variant counts `analyze` needs.

## Layout

| Module | Role |
|---|---|
| `src/ga4/` | Data API ingestion (read-only), report specs, synthetic data |
| `src/inspect/` | Codebase scan (events, consent, persistence, pacing constants), question audit |
| `src/metrics/` | Metric catalog, gap analysis, engagement maths, findings |
| `src/hypotheses/` | Rule engine and Claude (structured output, evidence must cite finding ids) |
| `src/experiments/` | Spec builder (sample size, stopping rule), registry/approval, analysis |
| `src/flags/` | Deterministic assignment and the approval gate |
| `src/history/` | Append-only JSONL history |
| `src/report/` | Markdown report and static dashboard |
