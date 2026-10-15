// SYNTHETIC GA4-shaped data for offline dry runs and tests. It is NOT real
// QuantBattle traffic: every report built from it is stamped as synthetic,
// and the LLM is told so. Values are generated from a fixed seed.

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

function syntheticGa4({ seed = 7, lookbackDays = 28 } = {}) {
  const r = rng(seed);
  const segments = [];
  const eventsBySegment = [];
  const funnels = {
    // fraction of active users in the segment who fire each event
    page_view: 1, start_game_clicked: 0.22, game_started: 0.17, game_completed: 0.11,
    battle_started: 0.2, battle_finished: 0.13, questions_viewed: 0.35, question_submitted: 0.14,
    account_created: 0.04, returned_next_day: 0.09, brainteaser_played: 0.18, brainteaser_skipped: 0.3,
  };
  for (const nvr of ['new', 'returning']) {
    for (const device of ['desktop', 'mobile', 'tablet']) {
      const users = Math.round((nvr === 'new' ? 900 : 350) * (device === 'desktop' ? 1 : device === 'mobile' ? 0.8 : 0.08) * (0.9 + 0.2 * r()));
      const sessions = Math.round(users * (nvr === 'new' ? 1.1 : 1.9));
      const engRate = (device === 'mobile' ? 0.42 : 0.6) + (nvr === 'returning' ? 0.12 : 0) + 0.04 * r();
      segments.push({
        newVsReturning: nvr, deviceCategory: device, activeUsers: users, newUsers: nvr === 'new' ? users : 0,
        sessions, engagedSessions: Math.round(sessions * engRate), userEngagementDuration: Math.round(users * (device === 'mobile' ? 95 : 170)),
        averageSessionDuration: device === 'mobile' ? 105 : 190, bounceRate: 1 - engRate,
      });
      for (const [ev, f] of Object.entries(funnels)) {
        let frac = f * (nvr === 'returning' ? 1.3 : 1);
        if (device === 'mobile' && /battle|question_submitted/.test(ev)) frac *= ev.endsWith('finished') || ev === 'question_submitted' ? 0.6 : 0.9;
        const u = Math.round(users * Math.min(frac, 1) * (0.92 + 0.16 * r()));
        eventsBySegment.push({ eventName: ev, newVsReturning: nvr, deviceCategory: device, totalUsers: u, eventCount: Math.round(u * (ev === 'page_view' ? 3.2 : 1.4)) });
      }
    }
  }
  const pages = [
    ['/', 4200, 1500, 210000], ['/play.html', 1900, 700, 160000], ['/games.html', 1300, 620, 52000],
    ['/mentalmath.html', 900, 380, 61000], ['/careers.html', 700, 300, 40000],
  ].map(([pagePath, screenPageViews, activeUsers, userEngagementDuration]) => ({ pagePath, screenPageViews, activeUsers, userEngagementDuration }));
  const daily = Array.from({ length: lookbackDays }, (_, i) => {
    const d = new Date(); d.setUTCDate(d.getUTCDate() - lookbackDays + i);
    const base = 80 + 20 * Math.sin(i / 3) + 10 * r();
    return { date: d.toISOString().slice(0, 10).replace(/-/g, ''), activeUsers: Math.round(base), newUsers: Math.round(base * 0.7), sessions: Math.round(base * 1.3) };
  });
  const cohorts = [];
  for (let c = 0; c < 4; c++) {
    const size = 400 + Math.round(60 * r());
    for (let w = 0; w <= 4 - c; w++) cohorts.push({ cohort: `week_${c}`, cohortNthWeek: String(w).padStart(4, '0'), cohortActiveUsers: w === 0 ? size : Math.round(size * 0.11 * Math.pow(0.7, w - 1)) });
  }
  const wrap = rows => ({ rows, rowCount: rows.length, quality: { subjectToThresholding: false, sampled: false, dataLossFromOtherRow: false } });
  return {
    source: 'synthetic', synthetic: true, propertyId: null, lookbackDays, fetchedAt: new Date().toISOString(),
    registeredParams: [],
    reports: { segments: wrap(segments), eventsBySegment: wrap(eventsBySegment), pages: wrap(pages), daily: wrap(daily), cohorts: wrap(cohorts) },
    errors: {},
  };
}

module.exports = { syntheticGa4 };
