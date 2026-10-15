// Offline checks of how the GA4 client loads cached OAuth credentials.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createDataClient, READONLY_SCOPE } = require('../src/ga4/client');

function tokenFile(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qb-ga4-'));
  const file = path.join(dir, 'ga4-authorized-user.json');
  fs.writeFileSync(file, JSON.stringify(contents), { mode: 0o600 });
  return file;
}
const valid = { type: 'authorized_user', client_id: 'id.apps.googleusercontent.com', client_secret: 's', refresh_token: 'r', scopes: [READONLY_SCOPE] };

test('missing login gives a clear next step', () => {
  assert.throws(() => createDataClient({ tokenFile: '/nonexistent/ga4.json', credentialsFile: null }), /npm run ga4:login/);
});

test('rejects files that are not authorized-user credentials', () => {
  assert.throws(() => createDataClient({ tokenFile: tokenFile({ ...valid, type: 'service_account' }), credentialsFile: null }), /not an authorized-user/);
  assert.throws(() => createDataClient({ tokenFile: tokenFile({ ...valid, refresh_token: undefined }), credentialsFile: null }), /not an authorized-user/);
});

test('rejects credentials carrying any scope beyond analytics.readonly', () => {
  const f = tokenFile({ ...valid, scopes: [READONLY_SCOPE, 'https://www.googleapis.com/auth/analytics.edit'] });
  assert.throws(() => createDataClient({ tokenFile: f, credentialsFile: null }), /extra scopes/);
});

test('builds a Data API client from a valid cached login (no network)', async () => {
  const client = createDataClient({ tokenFile: tokenFile(valid), credentialsFile: null });
  assert.equal(typeof client.runReport, 'function');
  await client.close();
});
