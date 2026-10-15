// Assemble deterministic findings with stable ids. Hypotheses (from the LLM
// or the rule engine) must cite these ids; anything uncited is rejected.
//
// kind:
//   measured - computed from GA4 data (correlational)
//   code     - read from source code (a fact about the product, not behaviour)
//   content  - from the question-bank audit (candidate issues, needs review)
//   gap      - something we cannot measure yet

const pct = x => (x == null ? 'n/a' : `${(100 * x).toFixed(1)}%`);

function buildFindings({ engagement, codebase, questionAudit, gaps }) {
  const F = [];
  const add = (id, kind, statement, evidence = {}) => F.push({ id, kind, statement, evidence });
  const tag = engagement.synthetic ? ' [SYNTHETIC DATA]' : '';

  // ── Measured (GA4) ────────────────────────────────────────────────────────
  const o = engagement.overall;
  if (engagement.available) add('F-GA-overall', 'measured', `${o.activeUsers} active users, ${o.sessions} sessions, engagement rate ${pct(o.engagementRate)}.${tag}`, o);
  const t = engagement.byTenure;
  if (engagement.available && t.new && t.returning) {
    add('F-GA-tenure', 'measured', `Engagement rate: new ${pct(t.new.engagementRate)} vs returning ${pct(t.returning.engagementRate)}; engaged seconds/user ${Math.round(t.new.engagementSecondsPerUser)} vs ${Math.round(t.returning.engagementSecondsPerUser)}.${tag}`, t);
  }
  for (const [d, s] of Object.entries(engagement.byDevice)) {
    add(`F-GA-device-${d}`, 'measured', `${d}: ${s.activeUsers} users, engagement rate ${pct(s.engagementRate)}, ${Math.round(s.engagementSecondsPerUser || 0)} engaged s/user.${tag}`, s);
  }
  for (const f of engagement.available ? engagement.funnels.overall : []) {
    if (!f.from) continue;
    add(`F-GA-funnel-${f.id}`, 'measured', `${f.label}: ${pct(f.rate)} (${f.to}/${f.from}, 95% CI ${pct(f.lower)}-${pct(f.upper)}).${tag}`, f);
  }
  for (const [tenure, list] of Object.entries(engagement.funnels.byTenure)) {
    const b = list.find(x => x.id === 'battle_finish'), s = list.find(x => x.id === 'solo_finish');
    if (b?.from) add(`F-GA-funnel-${tenure}`, 'measured', `${tenure} users: battle finish ${pct(b.rate)}, solo finish ${pct(s?.rate)}.${tag}`, { battle: b, solo: s });
  }
  for (const g of engagement.deviceGaps) {
    add(`F-GA-devicegap-${g.device}-${g.funnel}`, 'measured', `${g.label} is lower on ${g.device} (${pct(g.deviceRate)}) than other devices (${pct(g.othersRate)}); difference ${pct(g.diff)}, 95% CI ${pct(g.ci[0])} to ${pct(g.ci[1])}. Observational.${tag}`, g);
  }
  const ret = engagement.retention.filter(r => r.week1Rate != null);
  if (ret.length) {
    const avg = ret.reduce((s, r) => s + r.week1Rate, 0) / ret.length;
    add('F-GA-retention', 'measured', `Week-1 retention across ${ret.length} weekly cohorts averages ${pct(avg)}.${tag}`, ret);
  }
  if (engagement.quality.length) add('F-GA-quality', 'measured', `GA4 applied thresholding/sampling to: ${engagement.quality.map(q => q.report).join(', ')}. Small segments may be hidden.`, engagement.quality);
  if (Array.isArray(engagement.registeredParams) && !engagement.registeredParams.length) add('F-GAP-ga4-dims', 'gap', 'No event parameters are registered as GA4 custom dimensions, so no event can be split by game, difficulty or category in the Data API.', {});

  // ── Code facts ────────────────────────────────────────────────────────────
  for (const p of codebase.pacing) add(`F-CODE-${p.id}`, 'code', p.statement, p);
  if (!codebase.consentModeConfigured) add('F-CODE-consent', 'code', 'GA4 loads on every page without a Consent Mode default; there is no consent banner.', {});
  if (codebase.server.flagsLoggedToConsoleOnly) add('F-CODE-flags-lost', 'code', 'Question flags (/api/flag) are console.log()ed only and never stored, so dispute rates cannot be computed.', {});
  if (codebase.server.matchesRecordedOnlyForRegisteredPairs) add('F-CODE-matches-partial', 'code', 'The matches table only records games where both players have accounts (including bots); guest games leave no server trace, and no match duration is stored.', {});
  if (codebase.quitCountedAsComplete) add('F-CODE-quit-as-complete', 'code', "Mental Math's Quit button calls endGame(), which fires game_completed: quits are counted as completions.", { location: 'mentalmath.js quitGame()' });
  const bs = codebase.events.find(e => e.name === 'battle_started');
  const wanted = { category: 'category', difficulty: 'difficulty', opponent_type: 'opponent type', queue_ms: 'queue time' };
  const lacking = bs ? Object.keys(wanted).filter(p => !bs.params.includes(p)) : [];
  if (lacking.length) add('F-CODE-battle-params', 'code', `battle_started only carries [${bs.params.join(', ')}]: no ${lacking.map(p => wanted[p]).join(', ')}.`, bs);

  // ── Content (question bank) ───────────────────────────────────────────────
  const qa = questionAudit;
  add('F-Q-summary', 'content', `Question bank: ${qa.totalQuestions} questions. Audit flags: ${Object.entries(qa.issueCounts).map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}. ${qa.highSeverity.length} high-severity.`, { issueCounts: qa.issueCounts, pools: qa.pools });
  const amb = qa.flagged.filter(r => r.issues.some(i => i.code === 'no_rounding_instruction'));
  if (amb.length) add('F-Q-ambiguous-format', 'content', `${amb.length} numeric questions have a 3+ decimal answer but no rounding/unit instruction (e.g. ${amb.slice(0, 4).map(a => a.id).join(', ')}); correct answers in another unit or precision may be marked wrong.`, amb.map(a => a.id));
  const dupes = qa.flagged.filter(r => r.issues.some(i => i.code === 'duplicate_title'));
  if (dupes.length) add('F-Q-duplicates', 'content', `${dupes.length} questions reuse another question's title across tiers (e.g. ${dupes.slice(0, 3).map(d => d.id).join(', ')}).`, dupes.map(d => d.id));
  const ibRepeat = qa.repeatRisk.filter(r => r.pool.startsWith('ib.') && r.size <= r.drawnPerMatch);
  if (ibRepeat.length) add('F-Q-ib-pool', 'content', `IB battle pools hold ${ibRepeat[0].size} questions per tier and each match draws ${ibRepeat[0].drawnPerMatch}: every IB match serves the identical question set.`, ibRepeat);
  if (qa.highSeverity.length) add('F-Q-high', 'content', `${qa.highSeverity.length} questions have high-severity issues (answer/step mismatch or tolerance stricter than requested rounding): ${qa.highSeverity.map(h => h.id).join(', ')}.`, qa.highSeverity);

  // ── Gaps ─────────────────────────────────────────────────────────────────
  for (const e of gaps.evaluations.filter(x => x.status !== 'measurable')) {
    add(`F-GAP-${e.id}`, 'gap', `Cannot yet measure "${e.name}" (${e.status}): missing ${e.missing.map(m => m.event === '(server)' ? 'server-side storage' : `${m.event}[${m.params.join(',')}]`).join('; ')}.`, e);
  }

  return F;
}

module.exports = { buildFindings };
