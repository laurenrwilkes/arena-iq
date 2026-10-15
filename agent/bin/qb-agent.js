#!/usr/bin/env node
// QuantBattle engagement agent CLI.
//
//   qb-agent run [--synthetic|--no-ga4] [--no-llm]   full observe → propose pass
//   qb-agent list                             experiments and their status
//   qb-agent approve <EXP-id> --by "<name>" [--attest review:code,...]   human approval (binds to spec hash)
//   qb-agent start <EXP-id>                   mark approved experiment as running (live on next deploy)
//   qb-agent analyze <EXP-id> --server <url> | --snapshot f   evaluate results (server needs QB_ADMIN_KEY)
//   qb-agent conclude <EXP-id> <keep|revert|inconclusive> --by "<name>" [--note "..."]
const fs = require('fs');
const path = require('path');
const { runAgent } = require('../src/run');
const registry = require('../src/experiments/registry');
const { analyze } = require('../src/experiments/analyze');
const history = require('../src/history/store');

const args = process.argv.slice(2);
const cmd = args[0];
const flag = name => args.includes(`--${name}`);
const opt = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };

async function main() {
  switch (cmd) {
    case 'run': {
      const run = await runAgent({ synthetic: flag('synthetic'), ga4: !flag('no-ga4'), llm: !flag('no-llm'), log: m => console.error(`· ${m}`) });
      console.log(`\nData: ${run.meta.dataSource}  |  Hypotheses: ${run.meta.hypothesisSource}`);
      console.log(`Measurable metrics: ${run.gaps.evaluations.filter(e => e.status === 'measurable').length}/${run.gaps.evaluations.length}`);
      console.log('\nTop hypotheses:');
      run.hypotheses.forEach(h => console.log(`  ${h.id}. [${h.area}] ${h.title}`));
      console.log('\nExperiments:');
      run.experiments.forEach(x => console.log(`  ${x.id}  ${x.status}  ${x.title}`));
      console.log(`\nReport:    ${path.join(run.meta.dataDir, 'report.md')}`);
      console.log(`Dashboard: ${path.join(run.meta.dataDir, 'dashboard.html')}`);
      break;
    }
    case 'list': {
      for (const x of registry.loadAll()) {
        const unmet = (x.prerequisites || []).filter(p => !p.satisfied).length;
        console.log(`${x.id}\t${x.status}\t${unmet ? `${unmet} prerequisites open` : 'ready'}\t${x.title}`);
      }
      break;
    }
    case 'approve': {
      const by = opt('by');
      const attest = (opt('attest') || '').split(',').map(s => s.trim()).filter(Boolean);
      const exp = registry.approve(registry.load(args[1]), by, opt('note') || '', attest);
      registry.save(exp);
      history.append('approval', { experimentId: exp.id, approvedBy: by, specHash: exp.approval.specHash });
      console.log(`${exp.id} approved by ${by}. Deploy the flagged code, then run: qb-agent start ${exp.id}`);
      break;
    }
    case 'start': {
      const exp = registry.start(registry.load(args[1]));
      registry.save(exp);
      history.append('assignment', { experimentId: exp.id, unit: exp.unit, variants: exp.variants.map(v => ({ key: v.key, weight: v.weight })), startedAt: exp.startedAt });
      console.log(`${exp.id} is running from ${exp.startedAt}.`);
      break;
    }
    case 'analyze': {
      const exp = registry.load(args[1]);
      const snapshot = opt('server') ? await fetchSnapshot(opt('server'), exp.id) : JSON.parse(fs.readFileSync(opt('snapshot'), 'utf8'));
      if (snapshot.unknownMetrics?.length) console.warn(`Warning: server cannot compute ${snapshot.unknownMetrics.join(', ')}`);
      const prior = exp.analysisLog?.length ? exp.analysisLog[exp.analysisLog.length - 1].state : {};
      const result = analyze(exp, snapshot, prior);
      exp.analysisLog = [...(exp.analysisLog || []), { ...result, analysedAt: new Date().toISOString() }];
      registry.save(exp);
      history.append('result', { experimentId: exp.id, asOf: result.asOf, primary: result.primary, guardrails: result.guardrails, srm: result.srm });
      history.append('decision', { experimentId: exp.id, hypothesisKey: exp.hypothesis.key, decision: `recommend:${result.recommendation}`, reason: result.reason, final: false });
      console.log(`${exp.id}: ${result.recommendation.toUpperCase()}\n${result.reason}`);
      break;
    }
    case 'conclude': {
      const [, id, decision] = args;
      if (!['keep', 'revert', 'inconclusive'].includes(decision)) throw new Error('decision must be keep|revert|inconclusive');
      const by = opt('by');
      if (!by) throw new Error('--by "<name>" is required: a human records the final decision');
      const exp = { ...registry.load(id), status: 'concluded', conclusion: { decision, by, note: opt('note') || '', at: new Date().toISOString() } };
      registry.save(exp);
      history.append('decision', { experimentId: exp.id, hypothesisKey: exp.hypothesis.key, decision, reason: opt('note') || '', by, final: true });
      console.log(`${exp.id} concluded: ${decision}.`);
      break;
    }
    default:
      console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 10).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
      process.exitCode = cmd ? 1 : 0;
  }
}

async function fetchSnapshot(server, id) {
  const key = process.env.QB_ADMIN_KEY;
  if (!key) throw new Error('Set QB_ADMIN_KEY (the server\'s ADMIN_KEY) to read experiment results');
  const res = await fetch(`${server.replace(/\/$/, '')}/api/admin/experiments/${encodeURIComponent(id)}/snapshot?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Snapshot request failed: HTTP ${res.status}`);
  return res.json();
}

main().catch(e => { console.error(`Error: ${e.message}`); process.exit(1); });
