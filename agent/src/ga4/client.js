// GA4 ingestion via the Data API. Read-only by construction: the Data API has
// no write methods, and we only ever request the analytics.readonly scope.
const fs = require('fs');
const config = require('../config');
const { BASE_REPORTS, PARAM_BREAKDOWNS, paramBreakdownReport, cohortReport } = require('./reports');

const READONLY_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

// Auth order:
//   1. GOOGLE_APPLICATION_CREDENTIALS set -> Google's default credentials.
//   2. OAuth authorized-user file from `npm run ga4:login` (default).
function createDataClient({ tokenFile = config.ga4.oauthTokenFile, credentialsFile = config.ga4.credentialsFile } = {}) {
  const { BetaAnalyticsDataClient } = require('@google-analytics/data');
  if (credentialsFile) return new BetaAnalyticsDataClient({ scopes: [READONLY_SCOPE] });

  if (!tokenFile || !fs.existsSync(tokenFile)) {
    throw new Error(`No GA4 login found at ${tokenFile}. Run: npm run ga4:login (see agent/README.md > GA4 login).`);
  }
  const mode = fs.statSync(tokenFile).mode & 0o077;
  if (mode) console.warn(`Warning: ${tokenFile} is readable by other users; run: chmod 600 "${tokenFile}"`);

  const creds = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
  if (creds.type !== 'authorized_user' || !creds.refresh_token || !creds.client_id || !creds.client_secret) {
    throw new Error(`${tokenFile} is not an authorized-user credentials file. Re-run: npm run ga4:login`);
  }
  const extra = (creds.scopes || []).filter(s => s !== READONLY_SCOPE);
  if (extra.length) throw new Error(`Cached GA4 login has extra scopes (${extra.join(', ')}). Re-run: npm run ga4:login`);

  const { GoogleAuth, UserRefreshClient } = require('google-auth-library');
  const authClient = new UserRefreshClient({ clientId: creds.client_id, clientSecret: creds.client_secret, refreshToken: creds.refresh_token });
  return new BetaAnalyticsDataClient({ auth: new GoogleAuth({ authClient, scopes: [READONLY_SCOPE] }) });
}

function normalize(response) {
  const dims = (response.dimensionHeaders || []).map(h => h.name);
  const mets = (response.metricHeaders || []).map(h => h.name);
  const rows = (response.rows || []).map(r => {
    const o = {};
    dims.forEach((d, i) => { o[d] = r.dimensionValues[i].value; });
    mets.forEach((m, i) => { o[m] = Number(r.metricValues[i].value); });
    return o;
  });
  const meta = response.metadata || {};
  return {
    rows,
    rowCount: response.rowCount || rows.length,
    quality: {
      subjectToThresholding: !!meta.subjectToThresholding,
      sampled: !!(meta.samplingMetadatas && meta.samplingMetadatas.length),
      dataLossFromOtherRow: !!meta.dataLossFromOtherRow,
    },
  };
}

async function fetchGa4({ propertyId, lookbackDays = 28, client } = {}) {
  if (!propertyId) throw new Error('GA4_PROPERTY_ID is not set. Use --synthetic for an offline dry run.');
  const ownClient = !client;
  if (!client) client = createDataClient();
  try {
    return await fetchReports(client, propertyId, lookbackDays);
  } finally {
    if (ownClient) await client.close().catch(() => {});
  }
}

async function fetchReports(client, propertyId, lookbackDays) {
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: `${lookbackDays}daysAgo`, endDate: 'yesterday' }];

  // Which event params are registered as custom dimensions?
  const [metadata] = await client.getMetadata({ name: `${property}/metadata` });
  const registeredParams = (metadata.dimensions || [])
    .filter(d => d.apiName && d.apiName.startsWith('customEvent:'))
    .map(d => d.apiName.slice('customEvent:'.length));

  const reports = {};
  const errors = {};
  const run = async (name, spec, { cohort = false } = {}) => {
    try {
      const [res] = await client.runReport({ property, ...(cohort ? {} : { dateRanges }), ...spec });
      reports[name] = normalize(res);
    } catch (e) {
      errors[name] = e.message;
    }
  };

  await Promise.all(Object.entries(BASE_REPORTS).map(([n, s]) => run(n, s)));
  await Promise.all(Object.entries(PARAM_BREAKDOWNS)
    .filter(([p]) => registeredParams.includes(p))
    .map(([p, evs]) => run(`param_${p}`, paramBreakdownReport(p, evs))));
  await run('cohorts', cohortReport(4), { cohort: true });

  return { source: 'ga4', synthetic: false, propertyId, lookbackDays, fetchedAt: new Date().toISOString(), registeredParams, reports, errors };
}

module.exports = { fetchGa4, normalize, createDataClient, READONLY_SCOPE };
