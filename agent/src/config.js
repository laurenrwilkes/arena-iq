// Central configuration. Everything is read from the environment so no
// credentials ever live in the repo.
const fs = require('fs');
const os = require('os');
const path = require('path');

const AGENT_ROOT = path.join(__dirname, '..');
const REPO_ROOT = path.join(AGENT_ROOT, '..');

// Load agent/.env if present (Node >= 20.12). Real environment variables win.
const ENV_FILE = path.join(AGENT_ROOT, '.env');
if (fs.existsSync(ENV_FILE) && typeof process.loadEnvFile === 'function') {
  const before = { ...process.env };
  process.loadEnvFile(ENV_FILE);
  for (const [k, v] of Object.entries(before)) process.env[k] = v;
}

const CONFIG_DIR = path.join(os.homedir(), '.config', 'quantbattle');
const expand = p => (p && p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p);

module.exports = {
  AGENT_ROOT,
  REPO_ROOT,
  DATA_DIR: process.env.QB_AGENT_DATA_DIR || path.join(AGENT_ROOT, 'data'),
  EXPERIMENTS_DIR: process.env.QB_AGENT_EXPERIMENTS_DIR || path.join(AGENT_ROOT, 'experiments'),

  // GA4 (read-only: analytics.readonly scope, and the Data API has no write
  // methods). Default auth is OAuth user credentials cached by
  // `npm run ga4:login`; GOOGLE_APPLICATION_CREDENTIALS (service account / ADC)
  // is optional and takes precedence when set.
  ga4: {
    propertyId: process.env.GA4_PROPERTY_ID || null,
    credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,
    oauthTokenFile: expand(process.env.GA4_OAUTH_TOKEN_FILE) || path.join(CONFIG_DIR, 'ga4-authorized-user.json'),
    lookbackDays: Number(process.env.GA4_LOOKBACK_DAYS || 28),
    measurementId: 'G-3DF233421J',
  },

  llm: {
    model: process.env.QB_AGENT_MODEL || 'claude-opus-5-5',
    effort: process.env.QB_AGENT_EFFORT || 'high',
  },
};
