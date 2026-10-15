// Deterministic engagement metrics from GA4 reports. Every number here is
// computed in code; the LLM only ever sees the results.
const stats = require('../stats');

const FUNNELS = [
  { id: 'battle_finish', from: 'battle_started', to: 'battle_finished', label: 'Battle started → finished' },
  { id: 'solo_finish', from: 'game_started', to: 'game_completed', label: 'Solo game started → completed' },
  { id: 'solo_click_to_start', from: 'start_game_clicked', to: 'game_started', label: 'Game card clicked → game started' },
  { id: 'practice_view_to_submit', from: 'questions_viewed', to: 'question_submitted', label: 'Practice question viewed → submitted', unit: 'events' },
  { id: 'brainteaser_play', from: null, to: 'brainteaser_played', label: 'Users playing the brain teaser' },
  { id: 'signup', from: null, to: 'account_created', label: 'Users creating an account' },
  { id: 'next_day_return', from: null, to: 'returned_next_day', label: 'Users returning on a later day (approx.)' },
];

function sum(rows, field) { return rows.reduce((s, r) => s + (r[field] || 0), 0); }

function groupBy(rows, keyFn) {
  const out = {};
  rows.forEach(r => { const k = keyFn(r); (out[k] = out[k] || []).push(r); });
  return out;
}

function funnelFor(eventRows, segmentRows, f) {
  const field = f.unit === 'events' ? 'eventCount' : 'totalUsers';
  const to = sum(eventRows.filter(r => r.eventName === f.to), field);
  const from = f.from ? sum(eventRows.filter(r => r.eventName === f.from), field) : sum(segmentRows, 'activeUsers');
  return { id: f.id, label: f.label, from, to, ...stats.wilsonInterval(Math.min(to, from), from) };
}

function computeEngagement(ga4) {
  const seg = ga4.reports.segments?.rows || [];
  const ev = ga4.reports.eventsBySegment?.rows || [];

  const segmentSummary = (rows) => {
    const sessions = sum(rows, 'sessions'), engaged = sum(rows, 'engagedSessions'), users = sum(rows, 'activeUsers');
    return { activeUsers: users, sessions, engagementRate: sessions ? engaged / sessions : null, engagementSecondsPerUser: users ? sum(rows, 'userEngagementDuration') / users : null, sessionsPerUser: users ? sessions / users : null };
  };

  const overall = segmentSummary(seg);
  const byTenure = Object.fromEntries(Object.entries(groupBy(seg, r => r.newVsReturning)).map(([k, rows]) => [k, segmentSummary(rows)]));
  const byDevice = Object.fromEntries(Object.entries(groupBy(seg, r => r.deviceCategory)).map(([k, rows]) => [k, segmentSummary(rows)]));

  const funnels = {
    overall: FUNNELS.map(f => funnelFor(ev, seg, f)),
    byTenure: Object.fromEntries(['new', 'returning'].map(t => [t, FUNNELS.map(f => funnelFor(ev.filter(r => r.newVsReturning === t), seg.filter(r => r.newVsReturning === t), f))])),
    byDevice: Object.fromEntries(Object.keys(byDevice).map(d => [d, FUNNELS.map(f => funnelFor(ev.filter(r => r.deviceCategory === d), seg.filter(r => r.deviceCategory === d), f))])),
  };

  // Device friction: compare each device to all other devices on each funnel.
  // Observational only - device mix correlates with traffic source, intent, etc.
  const deviceGaps = [];
  for (const f of FUNNELS.filter(x => x.from)) {
    for (const d of Object.keys(byDevice)) {
      const mine = funnels.byDevice[d].find(x => x.id === f.id);
      const others = Object.keys(byDevice).filter(o => o !== d).map(o => funnels.byDevice[o].find(x => x.id === f.id));
      const oFrom = sum(others, 'from'), oTo = sum(others, 'to');
      if (mine.from < 30 || oFrom < 30) continue;
      const diff = stats.diffInProportions({ successes: oTo, n: oFrom }, { successes: Math.min(mine.to, mine.from), n: mine.from });
      if (diff.upper < 0) deviceGaps.push({ funnel: f.id, label: f.label, device: d, deviceRate: diff.treatment, othersRate: diff.control, diff: diff.diff, ci: [diff.lower, diff.upper], n: mine.from });
    }
  }

  // Weekly cohort retention (week 1 / week 0).
  const cohortRows = ga4.reports.cohorts?.rows || [];
  const retention = Object.entries(groupBy(cohortRows, r => r.cohort)).map(([cohort, rows]) => {
    const w0 = rows.find(r => Number(r.cohortNthWeek) === 0)?.cohortActiveUsers || 0;
    const w1 = rows.find(r => Number(r.cohortNthWeek) === 1)?.cohortActiveUsers;
    return { cohort, size: w0, week1: w1 ?? null, week1Rate: w0 && w1 != null ? w1 / w0 : null };
  });

  const pages = (ga4.reports.pages?.rows || []).map(p => ({ ...p, engagementSecondsPerUser: p.activeUsers ? p.userEngagementDuration / p.activeUsers : null }));

  const quality = Object.entries(ga4.reports).filter(([, r]) => r.quality && (r.quality.subjectToThresholding || r.quality.sampled)).map(([name, r]) => ({ report: name, ...r.quality }));

  return { synthetic: !!ga4.synthetic, available: seg.length > 0, overall, byTenure, byDevice, funnels, deviceGaps, retention, pages, quality, registeredParams: ga4.registeredParams, errors: ga4.errors };
}

module.exports = { computeEngagement, FUNNELS };
