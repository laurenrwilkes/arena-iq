// Analytics & consent — loaded on every page before auth.js.
//
// Two sinks:
//   - GA4 via gtag (Consent Mode decides what GA stores; see the inline
//     consent default in each page's <head>).
//   - Our own /api/events store, for question-level and experiment data that
//     GA4 can't hold. Only used when analytics consent allows it.
//
// Privacy: the only identifier is qb_anon_id, a random UUID created after
// consent. No email, username or IP is attached to events.
(function () {
  const CONSENT_KEY = 'qb_consent';
  const ANON_KEY = 'qb_anon_id';
  const FLUSH_MS = 5000;
  const MAX_QUEUE = 50;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
    del(k) { try { localStorage.removeItem(k); } catch (_) {} },
  };

  const uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });

  // Visitors in the EEA, UK and Switzerland must opt in. We can't know the
  // country client-side, so European time zones are treated as opt-in
  // regions (over-inclusive on purpose). GA4 applies its own region rules
  // from the inline consent default.
  function inOptInRegion() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return /^Europe\//.test(tz) || /^Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)$/.test(tz);
    } catch (_) { return true; }
  }

  function consent() { return store.get(CONSENT_KEY); } // 'granted' | 'denied' | null
  function canTrack() {
    const c = consent();
    return c === 'granted' || (c === null && !inOptInRegion());
  }

  function anonId() {
    if (!canTrack()) return null;
    let id = store.get(ANON_KEY);
    if (!id) { id = uuid(); store.set(ANON_KEY, id); }
    return id;
  }

  // ── GA4 ────────────────────────────────────────────────────────────────────
  function ga(name, params) {
    try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (_) {}
  }

  // ── Server event queue ─────────────────────────────────────────────────────
  let queue = [];
  let timer = null;

  function flush(useBeacon) {
    if (!queue.length) return;
    const batch = queue.splice(0, MAX_QUEUE);
    const body = JSON.stringify({ events: batch });
    try {
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon('/api/events', new Blob([body], { type: 'text/plain' }));
      } else {
        fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true }).catch(() => {});
      }
    } catch (_) {}
    if (queue.length) flush(useBeacon);
  }

  function serverLog(event, props) {
    const id = anonId();
    if (!id) return;
    const p = Object.assign({}, props || {});
    const entry = {
      event,
      anon_id: id,
      game_session_id: p.game_session_id || null,
      question_id: p.question_id != null ? String(p.question_id) : null,
      client_ts: Date.now(),
      props: p,
    };
    delete p.game_session_id; delete p.question_id;
    queue.push(entry);
    if (queue.length >= MAX_QUEUE) flush(false);
    else if (!timer) timer = setTimeout(() => { timer = null; flush(false); }, FLUSH_MS);
  }

  // track(): GA4 + server. opts.ga=false keeps high-volume events out of GA4.
  function track(name, params, opts) {
    const o = opts || {};
    if (o.ga !== false) ga(name, Object.assign({}, params, o.beacon ? { transport_type: 'beacon' } : {}));
    if (o.server !== false) serverLog(name, params);
  }

  // ── Game sessions & abandonment ────────────────────────────────────────────
  // A game registers itself while in progress; if the page is hidden for good
  // (pagehide) before it ends, we record game_abandoned with its context.
  let active = null;
  const presented = {}; // question_id -> { at, firstInputSent, attempts }

  function startGame(game, props) {
    active = { game_session_id: uuid(), game, startedAt: Date.now(), ctx: Object.assign({}, props || {}) };
    return active.game_session_id;
  }
  function updateGame(ctx) { if (active) Object.assign(active.ctx, ctx); }
  function currentGame() { return active; }
  function elapsed() { return active ? Date.now() - active.startedAt : null; }
  function endGame() { const a = active; active = null; return a; }

  function abandonGame(reason, extra) {
    if (!active) return;
    const a = endGame();
    track('game_abandoned', Object.assign({
      game_session_id: a.game_session_id, game: a.game, reason,
      elapsed_ms: Date.now() - a.startedAt,
    }, a.ctx, extra || {}), { beacon: true });
  }

  function presentQuestion(questionId, props) {
    const key = String(questionId);
    if (presented[key]) return false;
    presented[key] = { at: Date.now(), firstInputSent: false, attempts: 0 };
    track('question_presented', Object.assign({ question_id: key }, props));
    return true;
  }
  function firstInput(questionId, props) {
    const p = presented[String(questionId)];
    if (!p || p.firstInputSent) return;
    p.firstInputSent = true;
    track('question_first_input', Object.assign({ question_id: String(questionId), ms_since_presented: Date.now() - p.at }, props), { ga: false });
  }
  function answerQuestion(questionId, props) {
    const p = presented[String(questionId)];
    if (p) p.attempts++;
    track('question_answered', Object.assign({
      question_id: String(questionId),
      response_ms: p ? Date.now() - p.at : null,
      attempts: p ? p.attempts : 1,
    }, props));
  }
  function resetQuestions() { Object.keys(presented).forEach(k => delete presented[k]); }

  // ── Post-game action (one per result screen) ──────────────────────────────
  let resultShown = null;
  function showResult(gameSessionId, game) { resultShown = { game_session_id: gameSessionId, game, at: Date.now() }; }
  function postGameAction(action) {
    if (!resultShown) return;
    const r = resultShown; resultShown = null;
    track('post_game_action', { game_session_id: r.game_session_id, game: r.game, action, ms_since_result: Date.now() - r.at }, { beacon: action === 'leave' || action === 'practice' });
  }

  // ── Waits (matchmaking, waiting for opponent) ─────────────────────────────
  let wait = null;
  function startWait(waitType, gameSessionId) {
    if (wait) return;
    wait = { wait_type: waitType, game_session_id: gameSessionId || (active && active.game_session_id) || null, at: Date.now() };
    track('wait_started', { wait_type: waitType, game_session_id: wait.game_session_id }, { ga: false });
  }
  function endWait(outcome) {
    if (!wait) return;
    const w = wait; wait = null;
    track('wait_ended', { wait_type: w.wait_type, game_session_id: w.game_session_id, wait_ms: Date.now() - w.at, outcome }, { ga: false, beacon: outcome === 'left' });
  }

  // ── Experiments ────────────────────────────────────────────────────────────
  const exposed = {};
  function exposure(experimentId, variant) {
    if (!experimentId || !variant || exposed[experimentId]) return;
    exposed[experimentId] = true;
    track('experiment_exposure', { experiment_id: experimentId, variant });
  }

  window.addEventListener('pagehide', () => {
    endWait('left');
    abandonGame('page_exit');
    postGameAction('leave');
    flush(true);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });

  // Client errors feed the experiment error-rate guardrail (server only, capped).
  let errorsSent = 0;
  window.addEventListener('error', (e) => {
    if (errorsSent >= 3) return;
    errorsSent++;
    serverLog('client_error', { message: String(e.message || '').slice(0, 200), source: String(e.filename || '').split('/').pop().slice(0, 60), line: e.lineno || null });
  });

  // ── Consent banner ─────────────────────────────────────────────────────────
  function setConsent(value) {
    store.set(CONSENT_KEY, value);
    try {
      if (typeof gtag === 'function') gtag('consent', 'update', { analytics_storage: value });
    } catch (_) {}
    if (value === 'denied') { store.del(ANON_KEY); queue = []; }
    const el = document.getElementById('qb-consent');
    if (el) el.remove();
    document.body.style.paddingBottom = '';
  }

  function showBanner() {
    if (consent() !== null || document.getElementById('qb-consent')) return;
    const optIn = inOptInRegion();
    const el = document.createElement('div');
    el.id = 'qb-consent';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Analytics consent');
    el.innerHTML = `
      <p>We use privacy-friendly analytics (Google Analytics plus anonymous gameplay stats) to make the games better. No ads, no selling data.${optIn ? ' Nothing is collected unless you accept.' : ''}</p>
      <div class="qb-consent-actions">
        <button type="button" class="btn btn-ghost" data-consent="denied">Decline</button>
        <button type="button" class="btn btn-primary" data-consent="granted">${optIn ? 'Accept' : 'OK'}</button>
      </div>`;
    el.addEventListener('click', (e) => {
      const v = e.target && e.target.getAttribute && e.target.getAttribute('data-consent');
      if (v) setConsent(v);
    });
    const style = document.createElement('style');
    style.textContent = `
      #qb-consent { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9999; max-width: 720px; margin: 0 auto;
        display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap;
        background: var(--card2, #1e2c47); color: var(--t1, #f8fafc); border: 1px solid var(--border, rgba(255,255,255,.08));
        border-radius: var(--r, 12px); padding: 14px 16px; box-shadow: var(--shadow, 0 8px 32px rgba(0,0,0,.5)); font-size: .85rem; }
      #qb-consent p { margin: 0; flex: 1 1 320px; color: var(--t2, #94a3b8); line-height: 1.5; }
      #qb-consent .qb-consent-actions { display: flex; gap: 8px; }
      #qb-consent .btn { padding: 8px 16px; font-size: .85rem; }`;
    document.head.appendChild(style);
    document.body.appendChild(el);
    // The banner is fixed to the bottom; reserve room so it can't cover buttons at the end of the page.
    document.body.style.paddingBottom = (el.offsetHeight + 32) + 'px';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
  else showBanner();

  window.QBAnalytics = {
    canTrack, anonId, consent, setConsent, track, ga,
    startGame, updateGame, currentGame, elapsed, endGame, abandonGame,
    presentQuestion, firstInput, answerQuestion, resetQuestions,
    showResult, postGameAction, startWait, endWait, exposure, flush,
  };
  // Back-compat: existing pages call trackEvent() for GA4 funnel events.
  window.trackEvent = function (name, params) { ga(name, params); };
})();
