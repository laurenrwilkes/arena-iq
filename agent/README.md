# QuantBattle engagement agent

Reads GA4, inspects this repo, finds which engagement metrics are missing, proposes instrumentation, ranks hypotheses, and designs A/B experiments that need a human to approve them. Claude proposes hypotheses and changes. Every metric and statistic is computed by deterministic code.

## Setup

```bash
cd agent && npm install
npm test          # 26 tests
npm run demo      # offline dry run on SYNTHETIC data, no LLM -> data/synthetic/
```

Real run: put settings in `agent/.env` (gitignored, loaded automatically):

```bash
GA4_PROPERTY_ID=123456789     # GA4 Admin > Property settings > Property details (digits only)
ANTHROPIC_API_KEY=...         # optional; without it, use --no-llm
```

then `npm run ga4:login` once (below) and `node bin/qb-agent.js run` (or `--no-ga4` for a code-only run).

## GA4 login (OAuth, single user)

The agent signs in to GA4 as you via OAuth with a Desktop OAuth client, asking only for `analytics.readonly`. No service account key is needed; `GOOGLE_APPLICATION_CREDENTIALS` is optional and wins if set.

**1. Create the Desktop OAuth client** (Google Cloud Console, any project you can create resources in):

1. **APIs & Services → Library** → enable **Google Analytics Data API**.
2. **Google Auth Platform → Branding** (shown as "OAuth consent screen" in older consoles) → Get started. App name `QuantBattle agent`, your email as support and developer contact.
3. **Audience**: choose **Internal** if the project belongs to a Google Workspace org and your account is in it (no test users needed). Otherwise choose **External**, leave it in **Testing**, and under **Test users** click **Add users** and add the Google account that can see the GA4 property.
4. **Data access** → Add or remove scopes → add `https://www.googleapis.com/auth/analytics.readonly` → Save.
5. **Clients → Create client** → Application type **Desktop app** → name it → Create → **Download JSON**.
6. Move it out of Downloads to the default location:
   ```bash
   mkdir -p ~/.config/quantbattle && chmod 700 ~/.config/quantbattle
   mv ~/Downloads/client_secret_*.json ~/.config/quantbattle/oauth-client.json
   chmod 600 ~/.config/quantbattle/oauth-client.json
   ```

Your Google account also needs at least **Viewer** access on the GA4 property (GA4 Admin → Property access management).

**2. Log in once:**

```bash
cd agent
npm run ga4:login
```

This creates `agent/.venv`, installs `google-auth-oauthlib`, and opens your browser. Pick your account. For an External app in Testing, Google warns "Google hasn't verified this app": click **Continue** (it's your own client). Grant read-only Analytics access. The script saves your credentials to `~/.config/quantbattle/ga4-authorized-user.json` (mode 600). It refuses to write anywhere inside the repository.

**3. Check it works:**

```bash
npm run test:ga4     # prints active users for the last 7 days
```

Notes:
- External apps in **Testing** get refresh tokens that expire after **7 days**. When GA4 calls start failing with `invalid_grant`, run `npm run ga4:login` again. Internal apps don't have this limit.
- To revoke access: https://myaccount.google.com/permissions, then delete the token file.
- Paths can be overridden with `GA4_OAUTH_CLIENT_FILE` / `GA4_OAUTH_TOKEN_FILE` in `agent/.env`.

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
