// Live GA4 check: fetches active users for the last 7 days with the cached
// OAuth login. Skipped (not failed) until GA4_PROPERTY_ID is set and
// `npm run ga4:login` has been run.   Run alone with: npm run test:ga4
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const config = require('../src/config');
const { createDataClient } = require('../src/ga4/client');

const { propertyId, oauthTokenFile, credentialsFile } = config.ga4;
const missing = !propertyId ? 'GA4_PROPERTY_ID is not set in agent/.env'
  : !credentialsFile && !fs.existsSync(oauthTokenFile) ? `no GA4 login at ${oauthTokenFile} (run: npm run ga4:login)`
    : null;

test('GA4: active users over the last 7 days', { skip: missing || false, timeout: 60000 }, async () => {
  const client = createDataClient();
  try {
    const [res] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    });
    const activeUsers = Number(res.rows?.[0]?.metricValues?.[0]?.value ?? 0);
    assert.ok(Number.isInteger(activeUsers) && activeUsers >= 0, `activeUsers should be a non-negative integer, got ${activeUsers}`);
    console.log(`GA4 property ${propertyId}: ${activeUsers} active users in the last 7 days`);
  } finally {
    await client.close();
  }
});
