// Isolated local previews of the real app. Each preview is a git worktree of
// a given ref under agent/.previews/, running the real server on its own port
// with a throwaway database. A small "preview harness" is applied to the
// worktree only (never committed): it strips GA4 and Sentry so previews can't
// pollute production data, labels the page, and for question proposals
// injects the proposed question. Nothing here pushes or deploys.
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { execFileSync, spawn, spawnSync } = require('child_process');
const { AGENT_ROOT, REPO_ROOT } = require('../config');

const PREVIEW_ROOT = process.env.QB_PREVIEW_ROOT || path.join(AGENT_ROOT, '.previews');
const SERVER_MODULES = path.join(REPO_ROOT, 'server', 'node_modules');
const running = new Map(); // name -> { proc, port, ref, url }
let nextPort = Number(process.env.QB_PREVIEW_PORT_BASE || 4101);

const git = (args, cwd = REPO_ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// The server's native SQLite module is built for one Node version; find a
// Node binary that can load it (installing Node 22 locally if needed).
let cachedNode = null;
function serverNode() {
  if (cachedNode) return cachedNode;
  if (!fs.existsSync(SERVER_MODULES)) throw new Error('server/node_modules is missing: run `npm install` in server/ first.');
  // Requiring the module isn't enough: the native binding loads when a database opens.
  const probe = bin => spawnSync(bin, ['-e', `new (require(${JSON.stringify(path.join(SERVER_MODULES, 'better-sqlite3'))}))(':memory:')`], { stdio: 'ignore' }).status === 0;
  const local = path.join(AGENT_ROOT, '.tools', 'node22', 'node_modules', 'node', 'bin', 'node');
  for (const bin of [process.env.QB_PREVIEW_NODE, 'node', local].filter(Boolean)) {
    if ((bin === local ? fs.existsSync(bin) : true) && probe(bin)) return (cachedNode = bin);
  }
  console.error('· Installing Node 22 locally for previews (one-time)…');
  execFileSync('npm', ['install', '--prefix', path.join(AGENT_ROOT, '.tools', 'node22'), '--no-audit', '--no-fund', 'node@22'], { stdio: 'inherit' });
  if (probe(local)) return (cachedNode = local);
  throw new Error('No Node version can load server/node_modules/better-sqlite3. Set QB_PREVIEW_NODE to a working node binary.');
}

function ensureWorktree(name, ref) {
  const dir = path.join(PREVIEW_ROOT, name);
  fs.mkdirSync(PREVIEW_ROOT, { recursive: true });
  if (!fs.existsSync(path.join(dir, '.git'))) {
    git(['worktree', 'add', '--detach', '--force', dir, ref]);
  } else {
    git(['checkout', '--quiet', '--detach', '--force', ref], dir);
    git(['reset', '--quiet', '--hard'], dir);
    git(['clean', '--quiet', '-fd'], dir);
  }
  const link = path.join(dir, 'server', 'node_modules');
  if (!fs.existsSync(link)) fs.symlinkSync(SERVER_MODULES, link, 'dir');
  return dir;
}

// ── Preview harness (uncommitted, in the worktree only) ──────────────────────
const GTAG_TAG = /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]*"><\/script>\n?/g;
const SENTRY_DSN = /window\.__SENTRY_DSN__\s*=\s*'[^']*';/g;

function badge(label) {
  return `<script>/* review preview */(function(){
  var q = new URLSearchParams(location.search);
  if (q.get('resetStorage') === '1') { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} q.delete('resetStorage'); location.replace(location.pathname + (q.toString() ? '?' + q : '')); return; }
  var b = document.createElement('div');
  b.textContent = ${JSON.stringify(`PREVIEW · ${label}`)};
  b.setAttribute('style','position:fixed;left:10px;bottom:10px;z-index:99999;pointer-events:none;font:600 11px system-ui;letter-spacing:.04em;padding:4px 8px;border-radius:6px;background:#f59e0b;color:#111;opacity:.9');
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(b); });
})();</script>`;
}

function applyHarness(dir, { label, question } = {}) {
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const p = path.join(dir, f);
    let html = fs.readFileSync(p, 'utf8');
    html = html.replace(GTAG_TAG, '').replace(SENTRY_DSN, "window.__SENTRY_DSN__ = '';");
    html = html.replace('</head>', `${badge(label)}\n</head>`);
    if (question && f === 'index.html') html = html.replace('</body>', `${autoOpenScript()}\n</body>`);
    fs.writeFileSync(p, html);
  }
  if (question) injectQuestion(dir, question);
}

// Open ?preview=<id> in the practice page once questions have loaded, and
// close the homepage puzzle overlay so it doesn't cover the question.
function autoOpenScript() {
  return `<script>/* review preview */(function(){
  var id = new URLSearchParams(location.search).get('preview'); if (!id) return;
  var tries = 0, t = setInterval(function(){
    tries++;
    if (document.getElementById('bt-modal') && typeof closeBrainteaser === 'function') closeBrainteaser();
    if (typeof flatList !== 'undefined' && flatList.some(function(q){ return q.id === id; })) { clearInterval(t); try { selectProblem(id); } catch (e) {} }
    if (tries > 150) clearInterval(t);
  }, 100);
})();</script>`;
}

function injectQuestion(dir, p) {
  const serverDir = path.join(dir, 'server');
  const id = p.replaces || p.id;
  fs.writeFileSync(path.join(serverDir, 'preview-questions.json'), JSON.stringify([{ id, tier: p.tier, replaces: p.replaces || null, question: p.question }], null, 2));
  const qFile = path.join(serverDir, 'questions.js');
  let src = fs.readFileSync(qFile, 'utf8');
  const at = src.lastIndexOf('module.exports = {');
  if (at < 0) throw new Error('questions.js layout not recognised; cannot inject the preview question');
  const block = `
// ── REVIEW PREVIEW (uncommitted; preview worktree only) ──────────────────────
{
  const previews = require('./preview-questions.json');
  for (const p of previews) {
    for (const tiers of Object.values(QUESTIONS)) for (const list of Object.values(tiers)) {
      const i = list.findIndex(q => q.id === p.id || q.id === p.replaces);
      if (i >= 0) list.splice(i, 1);
    }
    QUESTIONS.quant[p.tier].unshift({ ...p.question, id: p.id, track: 'trading', active: true });
  }
  // Battles at the proposal's tier always include it, so it can be played there too.
  const baseDraw = getRandomQuestions;
  getRandomQuestions = function (category, difficulty, n) {
    const forced = category === 'quant' ? previews.filter(p => p.tier === difficulty).map(p => QUESTIONS.quant[p.tier].find(q => q.id === p.id)) : [];
    const rest = baseDraw(category, difficulty, n).filter(q => !forced.some(f => f.id === q.id));
    return [...forced, ...rest].slice(0, n);
  };
}
`;
  fs.writeFileSync(qFile, src.slice(0, at) + block + '\n' + src.slice(at));
}

// ── Servers ──────────────────────────────────────────────────────────────────
function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      http.get(url, res => { res.resume(); resolve(); }).on('error', () => {
        if (Date.now() - start > timeoutMs) reject(new Error(`Preview did not start at ${url}`));
        else setTimeout(tick, 250);
      });
    };
    tick();
  });
}

async function start(name, ref, { label, question } = {}) {
  const sha = git(['rev-parse', '--short', ref]);
  const existing = running.get(name);
  if (existing && existing.sha === sha && existing.proc.exitCode === null) return existing;
  stop(name);
  const dir = ensureWorktree(name, ref);
  applyHarness(dir, { label: label || `${name} (${ref} @ ${sha})`, question });
  const port = existing ? existing.port : nextPort++;
  const dbPath = path.join(PREVIEW_ROOT, `${name}.db`);
  for (const f of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) fs.rmSync(f, { force: true });
  // A minimal environment: no production keys, no GA/Sentry/email.
  const env = {
    PATH: process.env.PATH, HOME: process.env.HOME, PORT: String(port), DB_PATH: dbPath,
    JWT_SECRET: crypto.randomBytes(16).toString('hex'), ADMIN_KEY: crypto.randomBytes(16).toString('hex'),
  };
  const proc = spawn(serverNode(), [path.join(dir, 'server', 'index.js')], { cwd: path.join(dir, 'server'), env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  proc.stdout.on('data', d => { log = (log + d).slice(-4000); });
  proc.stderr.on('data', d => { log = (log + d).slice(-4000); });
  const url = `http://localhost:${port}`;
  const entry = { name, ref, sha, port, url, proc, dir, log: () => log };
  running.set(name, entry);
  try { await waitForServer(url); } catch (e) { stop(name); throw new Error(`${e.message}\n${log}`); }
  return entry;
}

function stop(name) {
  const e = running.get(name);
  if (e && e.proc.exitCode === null) e.proc.kill();
  running.delete(name);
}

function stopAll() { for (const name of [...running.keys()]) stop(name); }

function status() {
  return [...running.values()].map(e => ({ name: e.name, ref: e.ref, sha: e.sha, url: e.url, alive: e.proc.exitCode === null }));
}

// ── Diffs for UX proposals ───────────────────────────────────────────────────
function branchInfo(base, branch) {
  const exists = ref => { try { git(['rev-parse', '--verify', '--quiet', ref]); return true; } catch { return false; } };
  if (!exists(branch)) return { ok: false, error: `Branch ${branch} not found` };
  if (!exists(base)) return { ok: false, error: `Base ${base} not found` };
  const mergeBase = git(['merge-base', base, branch]);
  const commits = git(['log', '--format=%h %s', `${mergeBase}..${branch}`]).split('\n').filter(Boolean);
  return {
    ok: true, mergeBase: mergeBase.slice(0, 7), commits,
    singleChange: commits.length === 1,
    stat: git(['diff', '--stat', `${mergeBase}..${branch}`]),
    diff: git(['diff', `${mergeBase}..${branch}`]),
  };
}

module.exports = { PREVIEW_ROOT, serverNode, ensureWorktree, applyHarness, injectQuestion, start, stop, stopAll, status, branchInfo };
