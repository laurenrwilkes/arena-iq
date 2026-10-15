// GA4 ingestion via the Data API. Read-only by construction: the Data API has
// no write methods, and the service account only needs the Viewer role.
const { BASE_REPORTS, PARAM_BREAKDOWNS, paramBreakdownReport, cohortReport } = require('./reports');

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
  if (!client) {
    const { BetaAnalyticsDataClient } = require('@google-analytics/data');
    client = new BetaAnalyticsDataClient();
  }
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

module.exports = { fetchGa4, normalize };
