// GA4 report definitions. Kept declarative so the analysis layer can see
// exactly what was asked of GA4.

const SEGMENT_DIMS = [{ name: 'newVsReturning' }, { name: 'deviceCategory' }];

const BASE_REPORTS = {
  segments: {
    dimensions: SEGMENT_DIMS,
    metrics: ['activeUsers', 'newUsers', 'sessions', 'engagedSessions', 'userEngagementDuration', 'averageSessionDuration', 'bounceRate'].map(name => ({ name })),
  },
  eventsBySegment: {
    dimensions: [{ name: 'eventName' }, ...SEGMENT_DIMS],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
  },
  pages: {
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'userEngagementDuration' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 50,
  },
  daily: {
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  },
};

// Params we would like to break events down by, if GA4 has them registered.
const PARAM_BREAKDOWNS = {
  game: ['start_game_clicked', 'game_started', 'game_completed'],
  difficulty: ['game_started', 'game_completed', 'questions_viewed', 'question_submitted'],
  is_quant_battle: ['battle_started', 'battle_finished'],
  category: ['battle_started', 'battle_finished', 'questions_viewed'],
  opponent_type: ['battle_started', 'battle_finished'],
};

function paramBreakdownReport(param, events) {
  return {
    dimensions: [{ name: 'eventName' }, { name: `customEvent:${param}` }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: events } } },
  };
}

function cohortReport(weeks = 4) {
  // Weekly cohorts by first session date, ending last week.
  const cohorts = [];
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - end.getUTCDay() - 1); // last Saturday
  for (let i = weeks; i >= 1; i--) {
    const e = new Date(end); e.setUTCDate(end.getUTCDate() - 7 * (i - 1));
    const s = new Date(e); s.setUTCDate(e.getUTCDate() - 6);
    const iso = d => d.toISOString().slice(0, 10);
    cohorts.push({ name: `week_of_${iso(s)}`, dimension: 'firstSessionDate', dateRange: { startDate: iso(s), endDate: iso(e) } });
  }
  return {
    dimensions: [{ name: 'cohort' }, { name: 'cohortNthWeek' }],
    metrics: [{ name: 'cohortActiveUsers' }],
    cohortSpec: { cohorts, cohortsRange: { granularity: 'WEEKLY', startOffset: 0, endOffset: weeks } },
  };
}

module.exports = { BASE_REPORTS, PARAM_BREAKDOWNS, paramBreakdownReport, cohortReport };
