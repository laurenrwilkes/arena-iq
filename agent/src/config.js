// Central configuration. Everything is read from the environment so no
// credentials ever live in the repo.
const path = require('path');

const AGENT_ROOT = path.join(__dirname, '..');
const REPO_ROOT = path.join(AGENT_ROOT, '..');

module.exports = {
  AGENT_ROOT,
  REPO_ROOT,
  DATA_DIR: process.env.QB_AGENT_DATA_DIR || path.join(AGENT_ROOT, 'data'),
  EXPERIMENTS_DIR: process.env.QB_AGENT_EXPERIMENTS_DIR || path.join(AGENT_ROOT, 'experiments'),

  // GA4: a service account with the *Viewer* role on the property. The Data
  // API itself exposes no write methods, so this path is read-only end to end.
  ga4: {
    propertyId: process.env.GA4_PROPERTY_ID || null,
    // GOOGLE_APPLICATION_CREDENTIALS is picked up by the Google client directly.
    credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,
    lookbackDays: Number(process.env.GA4_LOOKBACK_DAYS || 28),
    measurementId: 'G-3DF233421J',
  },

  llm: {
    model: process.env.QB_AGENT_MODEL || 'claude-opus-5-5',
    effort: process.env.QB_AGENT_EFFORT || 'high',
  },
};
