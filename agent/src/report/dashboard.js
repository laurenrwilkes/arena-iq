// Static, self-contained HTML dashboard. Data is embedded as JSON so the file
// can be opened directly or served from anywhere; no external requests.

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const pct = x => (x == null ? 'n/a' : `${(100 * x).toFixed(1)}%`);

function funnelBars(funnels) {
  return funnels.filter(f => f.from).map(f => `
    <div class="bar-row" title="${esc(f.label)}: ${pct(f.rate)} (${f.to}/${f.from}), 95% CI ${pct(f.lower)}–${pct(f.upper)}">
      <span class="bar-label">${esc(f.label)}</span>
      <span class="bar-track"><span class="bar" style="width:${Math.max(0.5, 100 * (f.rate || 0)).toFixed(1)}%"></span>
        <span class="ci" style="left:${(100 * (f.lower || 0)).toFixed(1)}%;width:${(100 * ((f.upper || 0) - (f.lower || 0))).toFixed(1)}%"></span></span>
      <span class="bar-value">${pct(f.rate)} <small>n=${f.from}</small></span>
    </div>`).join('');
}

function experimentCard(x) {
  const unmet = x.prerequisites.filter(p => !p.satisfied);
  const last = x.analysisLog?.[x.analysisLog.length - 1];
  return `<article class="card">
    <header><span class="pill pill-${x.status}">${esc(x.status)}</span> <strong>${esc(x.id)}</strong> ${esc(x.title)}</header>
    <p>${esc(x.hypothesis.statement)}</p>
    <dl>
      <dt>Primary</dt><dd>${esc(x.primaryMetric.id)} (${esc(x.primaryMetric.direction)}; baseline ${pct(x.primaryMetric.baseline)}, ${esc(x.primaryMetric.baselineSource)})</dd>
      <dt>Guardrails</dt><dd>${x.guardrails.map(g => esc(g.id)).join(', ')}</dd>
      <dt>Stopping</dt><dd>mSPRT α=${x.stoppingRule.alpha}, MDE ${pct(x.stoppingRule.mdeAbsolute)}, ≥${x.stoppingRule.minDaysRunning}d, cap ${x.stoppingRule.maxUnitsPerArm}/arm or ${x.stoppingRule.maxDays}d</dd>
      <dt>Feasibility</dt><dd>${esc(x.feasibility.note)}</dd>
      ${x.approval ? `<dt>Approved</dt><dd>${esc(x.approval.approvedBy)} at ${esc(x.approval.approvedAt)}</dd>` : ''}
      ${last ? `<dt>Latest</dt><dd><strong>${esc(last.recommendation)}</strong>: ${esc(last.reason)}</dd>` : ''}
    </dl>
    ${unmet.length ? `<details><summary>${unmet.length} prerequisite(s) before approval</summary><ul>${unmet.map(p => `<li>${esc(p.description)}</li>`).join('')}</ul></details>` : ''}
  </article>`;
}

function renderDashboard(run) {
  const { engagement: e, gaps, hypotheses, experiments, meta, findings } = run;
  const statusCount = s => gaps.evaluations.filter(x => x.status === s).length;
  const frictions = [
    ...e.deviceGaps.map(g => ({ kind: 'measured', text: `${g.label}: ${g.device} ${pct(g.deviceRate)} vs ${pct(g.othersRate)} elsewhere` })),
    ...findings.filter(f => f.kind === 'code' && f.id.startsWith('F-CODE-pacing')).slice(0, 4).map(f => ({ kind: 'code', text: f.statement })),
    ...findings.filter(f => f.kind === 'content').slice(1, 4).map(f => ({ kind: 'content', text: f.statement })),
  ];
  const groups = {
    proposed: experiments.filter(x => ['proposed', 'approved'].includes(x.status)),
    running: experiments.filter(x => ['running', 'paused'].includes(x.status)),
    concluded: experiments.filter(x => x.status === 'concluded'),
  };

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Engagement Agent</title>
<style>
:root { color-scheme: light; --bg:#fcfcfb; --card:#ffffff; --border:#e4e3df; --text:#0b0b0b; --text2:#52514e; --muted:#8a8984; --series:#2a78d6; --ci:rgba(11,11,11,.35); --warn-bg:#fff4d6; --warn:#7a5200; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --bg:#1a1a19; --card:#232322; --border:#3a3a38; --text:#f0efec; --text2:#c3c2b7; --muted:#8f8e86; --series:#3987e5; --ci:rgba(240,239,236,.45); --warn-bg:#3a2e10; --warn:#f2c46b; } }
:root[data-theme="dark"] { color-scheme: dark; --bg:#1a1a19; --card:#232322; --border:#3a3a38; --text:#f0efec; --text2:#c3c2b7; --muted:#8f8e86; --series:#3987e5; --ci:rgba(240,239,236,.45); --warn-bg:#3a2e10; --warn:#f2c46b; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif; }
main { max-width:1100px; margin:0 auto; padding:24px 16px 64px; }
h1 { font-size:1.5rem; margin:0 0 4px; } h2 { font-size:1.1rem; margin:32px 0 12px; }
.sub { color:var(--text2); margin:0 0 16px; }
.banner { background:var(--warn-bg); color:var(--warn); border-radius:8px; padding:10px 14px; margin:12px 0; }
.tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
.tile, .card { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:14px; }
.tile .v { font-size:1.6rem; font-weight:650; font-variant-numeric:tabular-nums; } .tile .l { color:var(--text2); font-size:.85rem; }
.bar-row { display:grid; grid-template-columns:minmax(120px,240px) 1fr 110px; gap:10px; align-items:center; padding:5px 0; }
.bar-label { color:var(--text2); font-size:.9rem; } .bar-value { font-variant-numeric:tabular-nums; text-align:right; } .bar-value small { color:var(--muted); }
.bar-track { position:relative; height:14px; }
.bar { position:absolute; left:0; top:2px; height:10px; background:var(--series); border-radius:0 4px 4px 0; }
.ci { position:absolute; top:6px; height:2px; background:var(--ci); }
.bar-row:hover .bar-label { color:var(--text); }
table { width:100%; border-collapse:collapse; font-size:.9rem; } th, td { text-align:left; padding:6px 8px; border-bottom:1px solid var(--border); vertical-align:top; }
th { color:var(--text2); font-weight:600; } th.num, td.num { text-align:right; font-variant-numeric:tabular-nums; }
.pill { display:inline-block; font-size:.75rem; padding:1px 8px; border-radius:999px; border:1px solid var(--border); color:var(--text2); }
.cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:12px; }
.card header { margin-bottom:6px; } .card p { margin:6px 0; color:var(--text2); }
dl { display:grid; grid-template-columns:90px 1fr; gap:4px 10px; margin:8px 0; font-size:.88rem; } dt { color:var(--muted); } dd { margin:0; }
ol.hyp > li { margin-bottom:14px; } .ev code { font-size:.78rem; color:var(--text2); }
ul.friction li { margin-bottom:6px; } .kind { font-size:.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; margin-right:6px; }
.wrap { overflow-x:auto; }
@media (max-width:600px) { .bar-row { grid-template-columns:1fr 70px; } .bar-track { grid-column:1 / -1; grid-row:2; } }
</style></head>
<body><main>
<h1>QuantBattle engagement agent</h1>
<p class="sub">Run ${esc(meta.runId)} · ${esc(meta.generatedAt)} · data: ${esc(meta.dataSource)} · hypotheses: ${esc(meta.hypothesisSource)}</p>
${e.synthetic ? '<div class="banner"><strong>Synthetic data.</strong> GA4 figures are generated for a dry run and do not describe real users.</div>' : ''}
${!e.available && !e.synthetic ? '<div class="banner">No GA4 data in this run (code-only). Traffic figures below are empty, not zero.</div>' : ''}
${meta.llmError ? `<div class="banner">LLM step failed (${esc(meta.llmError)}); showing rule-based hypotheses.</div>` : ''}

<h2>Current engagement</h2>
<div class="tiles">
  <div class="tile"><div class="v">${e.overall.activeUsers}</div><div class="l">Active users (${esc(meta.lookbackDays)}d)</div></div>
  <div class="tile"><div class="v">${pct(e.overall.engagementRate)}</div><div class="l">Engagement rate</div></div>
  <div class="tile"><div class="v">${pct(e.byTenure.returning?.engagementRate)}</div><div class="l">Returning-user engagement</div></div>
  <div class="tile"><div class="v">${pct(e.byTenure.new?.engagementRate)}</div><div class="l">New-user engagement</div></div>
  <div class="tile"><div class="v">${statusCount('measurable')}/${gaps.evaluations.length}</div><div class="l">Metrics measurable today</div></div>
</div>
<h2>Funnels <small class="sub">(bar = rate, line = 95% CI; hover for counts)</small></h2>
<div class="card">${funnelBars(e.funnels.overall)}</div>
<div class="wrap"><table><thead><tr><th>Device</th><th class="num">Users</th><th class="num">Engagement</th><th class="num">Engaged s/user</th></tr></thead><tbody>
${Object.entries(e.byDevice).map(([d, s]) => `<tr><td>${esc(d)}</td><td class="num">${s.activeUsers}</td><td class="num">${pct(s.engagementRate)}</td><td class="num">${Math.round(s.engagementSecondsPerUser || 0)}</td></tr>`).join('')}
</tbody></table></div>

<h2>Biggest suspected friction points</h2>
<ul class="friction">${frictions.map(f => `<li><span class="kind">${esc(f.kind)}</span>${esc(f.text)}</li>`).join('')}</ul>

<h2>Proposed new metrics</h2>
<div class="wrap"><table><thead><tr><th>Metric</th><th>Status</th><th>Missing instrumentation</th></tr></thead><tbody>
${gaps.evaluations.map(ev => `<tr><td>${esc(ev.name)}</td><td><span class="pill">${esc(ev.status)}</span></td><td>${esc(ev.missing.map(m => m.event === '(server)' ? 'server-side storage' : `${m.event}[${m.params.join(', ')}]`).join('; ') || '—')}</td></tr>`).join('')}
</tbody></table></div>

<h2>Recommended experiments &amp; hypotheses</h2>
<ol class="hyp">${hypotheses.map(h => `<li><strong>${esc(h.title)}</strong> <span class="pill">${esc(h.area)}</span> <span class="pill">confidence ${esc(h.confidence)}</span>
  <div>${esc(h.hypothesis)}</div><div><em>Intervention:</em> ${esc(h.intervention)}</div>
  <div class="ev">${h.evidence.map(id => `<code>${esc(id)}</code>`).join(' ')}</div></li>`).join('')}</ol>
<div class="cards">${groups.proposed.map(experimentCard).join('') || '<p class="sub">None.</p>'}</div>

<h2>Running experiments</h2>
<div class="cards">${groups.running.map(experimentCard).join('') || '<p class="sub">None running. Experiments start only after human approval and deployment.</p>'}</div>

<h2>Completed experiments</h2>
<div class="cards">${groups.concluded.map(experimentCard).join('') || '<p class="sub">None yet.</p>'}</div>
</main>
<script type="application/json" id="run-data">${JSON.stringify({ meta, hypotheses, experiments: experiments.map(x => x.id) }).replace(/</g, '\\u003c')}</script>
</body></html>
`;
}

module.exports = { renderDashboard };
