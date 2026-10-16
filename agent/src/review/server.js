// Local review dashboard: http://localhost:4100 (bound to 127.0.0.1 only).
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
const { AGENT_ROOT, REPO_ROOT, DATA_DIR } = require('../config');
const proposals = require('./proposals');
const previews = require('./previews');
const { evaluateQuestion } = require('./evaluate');

const UI = path.join(AGENT_ROOT, 'review-ui', 'index.html');

function reviewerName() {
  if (process.env.QB_REVIEWER) return process.env.QB_REVIEWER;
  try { return execFileSync('git', ['config', 'user.name'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim() || 'reviewer'; } catch { return 'reviewer'; }
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

function summary(p) {
  const last = (p.reviews || []).at(-1);
  return { id: p.id, type: p.type, title: p.title, issue: p.decision?.issue, subject: p.decision?.subject, status: p.status, decided: last ? (last.label || last.decision) : null, deployment: p.deployment?.status || 'not_deployed', createdAt: p.createdAt };
}

function detail(p, { dir, historyDir }) {
  const out = { proposal: p, history: proposals.historyFor(p.id, { historyDir }) };
  if (p.type === 'question') out.evaluation = evaluateQuestion(p);
  if (p.type === 'ux') out.branch = previews.branchInfo(p.base, p.branch);
  return out;
}

async function startPreviews(p) {
  if (p.type === 'question') {
    const e = await previews.start(`q-${p.id}`, p.base || 'main', { label: `question proposal ${p.id}`, question: p });
    const qid = p.replaces || p.id;
    return { practice: `${e.url}/index.html?preview=${encodeURIComponent(qid)}&resetStorage=1`, battle: `${e.url}/play.html`, base: p.base || 'main', sha: e.sha };
  }
  const [cur, prop] = await Promise.all([
    previews.start('current', p.base, { label: `CURRENT · ${p.base}` }),
    previews.start(`ux-${p.id}`, p.branch, { label: `PROPOSED · ${p.id}` }),
  ]);
  return { current: cur.url, proposed: prop.url, path: p.affectedFlow.path, currentSha: cur.sha, proposedSha: prop.sha };
}

function createServer({ dir = proposals.PROPOSALS_DIR, historyDir = DATA_DIR } = {}) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    try {
      if (req.method === 'GET' && url.pathname === '/') return send(res, 200, fs.readFileSync(UI, 'utf8'), 'text/html; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/api/session') return send(res, 200, { reviewer: reviewerName(), previews: previews.status() });
      if (req.method === 'GET' && url.pathname === '/api/proposals') return send(res, 200, proposals.list(dir).map(summary));
      if (parts[0] === 'api' && parts[1] === 'proposals' && parts[2]) {
        const p = proposals.load(parts[2], dir);
        if (req.method === 'GET' && !parts[3]) return send(res, 200, detail(p, { dir, historyDir }));
        if (req.method === 'POST' && parts[3] === 'preview') return send(res, 200, await startPreviews(p));
        if (req.method === 'POST' && parts[3] === 'decision') {
          const body = await readBody(req);
          const updated = proposals.decide(p.id, { option: body.option, decision: body.decision, feedback: body.feedback || '', by: body.by || reviewerName() }, { dir, historyDir });
          return send(res, 200, detail(updated, { dir, historyDir }));
        }
      }
      send(res, 404, { error: 'not found' });
    } catch (e) {
      send(res, /No proposal/.test(e.message) ? 404 : 400, { error: e.message });
    }
  });
}

function serve({ port = 4100 } = {}) {
  const server = createServer();
  server.listen(port, '127.0.0.1', () => console.log(`Review dashboard: http://localhost:${port}  (Ctrl+C stops it and its previews)`));
  const shutdown = () => { previews.stopAll(); server.close(); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  return server;
}

module.exports = { createServer, serve };
