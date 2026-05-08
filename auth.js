// Auth module — handles register/login modal and token storage
const API = window.location.origin;

const Auth = (() => {
  let _user = null;

  function getToken() { return localStorage.getItem('aiq_token'); }
  function setToken(t) { localStorage.setItem('aiq_token', t); }
  function clearToken() { localStorage.removeItem('aiq_token'); }

  function getUser() { return _user; }

  async function fetchMe() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { clearToken(); return null; }
      _user = await res.json();
      return _user;
    } catch { return null; }
  }

  async function register(username, email, password) {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setToken(data.token);
    _user = data.user;
    return data.user;
  }

  async function login(email, password) {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setToken(data.token);
    _user = data.user;
    return data.user;
  }

  function logout() {
    clearToken();
    _user = null;
    window.location.href = 'index.html';
  }

  return { getToken, getUser, fetchMe, register, login, logout };
})();

// ── MODAL ────────────────────────────────────────────────────────────────────
function showAuthModal(onSuccess) {
  const existing = document.getElementById('auth-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-box">
        <div class="modal-tabs">
          <button class="modal-tab active" id="tab-login" onclick="switchAuthTab('login')">Log In</button>
          <button class="modal-tab" id="tab-register" onclick="switchAuthTab('register')">Sign Up</button>
        </div>

        <div id="auth-login">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="login-email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="login-password" placeholder="••••••••" />
          </div>
          <div class="auth-error" id="login-error"></div>
          <button id="login-btn" type="button" class="btn btn-primary" style="width:100%;justify-content:center" onclick="submitLogin()">Log In →</button>
          <p style="text-align:center;margin-top:16px;font-size:0.82rem;color:var(--t3)">
            No account? <a href="#" onclick="switchAuthTab('register')" style="color:var(--purple-l)">Sign up free</a>
          </p>
        </div>

        <div id="auth-register" style="display:none">
          <div class="form-group">
            <label>Username</label>
            <input type="text" id="reg-username" placeholder="apex_coder" maxlength="20" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="reg-email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="reg-password" placeholder="6+ characters" />
          </div>
          <div class="auth-error" id="reg-error"></div>
          <button id="reg-btn" type="button" class="btn btn-primary" style="width:100%;justify-content:center" onclick="submitRegister()">Create Free Account →</button>
          <p style="text-align:center;margin-top:16px;font-size:0.82rem;color:var(--t3)">
            Already have an account? <a href="#" onclick="switchAuthTab('login')" style="color:var(--purple-l)">Log in</a>
          </p>
        </div>
      </div>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px; }
    .modal-box { background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:36px;width:100%;max-width:420px;box-shadow:var(--shadow),var(--glow); }
    .modal-tabs { display:flex;gap:8px;margin-bottom:28px; }
    .modal-tab { flex:1;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:transparent;color:var(--t2);font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s; }
    .modal-tab.active { background:var(--grad);border-color:transparent;color:#fff; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block;font-size:0.8rem;font-weight:600;color:var(--t2);margin-bottom:6px; }
    .form-group input { width:100%;padding:10px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);color:var(--t1);font-size:0.9rem;outline:none;transition:border-color 0.2s; }
    .form-group input:focus { border-color:var(--purple); }
    .auth-error { color:var(--red);font-size:0.82rem;margin-bottom:12px;min-height:18px; }
  `;
  modal.appendChild(style);
  document.body.appendChild(modal);

  // Close on overlay click
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) modal.remove();
  });

  // Enter key submits
  modal.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const tab = document.getElementById('tab-login').classList.contains('active');
      tab ? submitLogin() : submitRegister();
    }
  });

  window._authSuccessCallback = onSuccess;
}

function switchAuthTab(tab) {
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

function setAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = msg;
}

function setAuthBtn(id, html, disabled) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  el.disabled = disabled;
}

async function submitLogin() {
  const email = (document.getElementById('login-email')?.value || '').trim();
  const password = document.getElementById('login-password')?.value || '';
  setAuthError('login-error', '');
  if (!email || !password) { setAuthError('login-error', 'Please enter your email and password.'); return; }
  setAuthBtn('login-btn', 'Logging in...', true);
  try {
    await Auth.login(email, password);
    document.getElementById('auth-modal')?.remove();
    if (window._authSuccessCallback) window._authSuccessCallback(Auth.getUser());
  } catch (e) {
    const msg = e.message || 'Something went wrong';
    const isNotFound = msg.toLowerCase().includes('invalid');
    setAuthError('login-error', isNotFound
      ? `${msg}. &nbsp;<a href="#" onclick="switchAuthTab('register')" style="color:var(--purple-l)">Create an account?</a>`
      : msg);
    setAuthBtn('login-btn', 'Log In →', false);
  }
}

async function submitRegister() {
  const username = (document.getElementById('reg-username')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const password = document.getElementById('reg-password')?.value || '';
  setAuthError('reg-error', '');
  if (!username || !email || !password) { setAuthError('reg-error', 'All fields are required.'); return; }
  setAuthBtn('reg-btn', 'Creating account...', true);
  try {
    await Auth.register(username, email, password);
    document.getElementById('auth-modal')?.remove();
    if (window._authSuccessCallback) window._authSuccessCallback(Auth.getUser());
  } catch (e) {
    setAuthError('reg-error', e.message || 'Something went wrong');
    setAuthBtn('reg-btn', 'Create Free Account →', false);
  }
}
