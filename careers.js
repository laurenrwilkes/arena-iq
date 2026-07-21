let currentUser = null;

const MAJOR_SUGGESTIONS = [
  'Mathematics', 'Applied Mathematics', 'Statistics', 'Computer Science',
  'Physics', 'Financial Engineering', 'Economics', 'Data Science',
  'Electrical Engineering', 'Operations Research', 'Actuarial Science',
];

const DEFAULT_PROFILE = {
  degreeLevel: 'B.S.',
  major: '',
  yearInSchool: 'Junior',
  gradMonthValue: '', // "YYYY-MM" from <input type="month">
  status: 'In Progress',
};

const STATE = {
  view: 'discover', // discover | tracker
  profile: { ...DEFAULT_PROFILE },
  search: '',
  activeCategory: null, // 'research' | 'trading' | 'developer' | null
  phdOnlyFilter: false,
  openJobId: null,
  applications: {}, // jobId -> application record (see loadProfile/saveProfile)
  expandedAppId: null,
};

const OUTCOME_OPTIONS = ['Pending', 'Accepted', 'Denied'];
const INTERVIEW_ROUNDS = [
  'Online Assessment (OA) / Codesignal',
  'First Round / Phone Screen',
  'Technical Interview (Math/Coding/Brainteasers)',
  'Superday / Final Round',
];
const PIPELINE_COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '📋' },
  { key: 'applied', label: 'Applied', icon: '📨' },
  { key: 'interviewing', label: 'Interviewing', icon: '🎤' },
  { key: 'offer', label: 'Offer', icon: '🎉' },
  { key: 'denied', label: 'Denied', icon: '❌' },
];

// ── JOB DATA ──────────────────────────────────────────────────────────────────
const JOBS = [
  {
    id: 'optiver-qr',
    firm: 'Optiver',
    role: 'Quantitative Research Intern',
    cycle: 'Summer 2027',
    category: 'research',
    location: 'Chicago, IL',
    degreeLevels: ['BS', 'MS'],
    phdOnly: false,
    majors: ['Mathematics', 'Statistics', 'Computer Science', 'Physics', 'Financial Engineering'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2029 },
    perks: ['Highly Competitive Pay', 'Housing Covered', 'Flights Covered'],
    skills: ['Probability', 'Statistics', 'Python'],
    highlySelective: false,
    description: "Optiver's Quantitative Research interns work alongside traders and researchers to design and backtest pricing and risk models for a market-making desk. You'll spend the summer building statistical models in Python, analyzing live market data, and presenting findings that directly influence how the firm prices options and other derivatives. No prior finance background is required — Optiver hires almost entirely from STEM majors and looks for raw mathematical horsepower.",
    timeline: [
      { phase: 'Week 1', detail: "Firm-wide training on market microstructure, options theory, and Optiver's internal trading tools." },
      { phase: 'Weeks 2–3', detail: 'Rotation through a live trading desk, shadowing traders and researchers to see how models translate into real quotes.' },
      { phase: 'Weeks 4–9', detail: 'Independent research project: build, backtest, and present a pricing or risk model to senior traders.' },
      { phase: 'Week 10', detail: 'Final project presentation to the desk and a formal wrap-up review for full-time consideration.' },
    ],
    interviewProcess: [
      'Online probability & mental math assessment',
      'First-round video interview covering probability, mental math, and market-making intuition',
      'Superday: back-to-back interviews with traders and researchers, including live trading games',
      'Offer decision, typically within 1–2 weeks of the superday',
    ],
  },
  {
    id: 'sig-qt',
    firm: 'Susquehanna International Group (SIG)',
    role: 'Quantitative Trader Intern',
    cycle: 'Summer 2027',
    category: 'trading',
    location: 'Bala Cynwyd, PA',
    degreeLevels: ['BS', 'MS'],
    phdOnly: false,
    majors: ['Mathematics', 'Statistics', 'Economics', 'Physics', 'Computer Science'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 8, year: 2028 },
    perks: ['Competitive Salary', 'Housing Stipend'],
    skills: ['Probability', 'Game Theory', 'Mental Math'],
    highlySelective: false,
    description: "SIG's trading internship drops you directly onto a live desk from day one. You'll learn to price options, manage risk, and make fast decisions under uncertainty alongside experienced traders, while also working through SIG's poker- and game-theory-driven curriculum — a hallmark of how the firm trains new traders to think probabilistically.",
    timeline: [
      { phase: 'Week 1', detail: "Classroom bootcamp on options pricing, probability, and SIG's trading simulators." },
      { phase: 'Weeks 2–4', detail: 'Poker and game-theory workshops run alongside live desk shadowing.' },
      { phase: 'Weeks 5–9', detail: 'Full desk rotation making real trading decisions with a risk limit and a mentor trader.' },
      { phase: 'Week 10', detail: 'Final trading performance review and full-time offer discussions.' },
    ],
    interviewProcess: [
      'Resume screen and online quantitative assessment',
      'First-round interview: probability puzzles and mental math under time pressure',
      'Final round: multiple interviews including a trading game and a behavioral fit conversation',
      'Offer decision',
    ],
  },
  {
    id: 'deshaw-qa',
    firm: 'D.E. Shaw',
    role: 'Quantitative Analyst Intern',
    cycle: 'Summer 2027',
    category: 'research',
    location: 'New York, NY',
    degreeLevels: ['BS', 'MS', 'PhD'],
    phdOnly: false,
    majors: ['Mathematics', 'Statistics', 'Computer Science', 'Physics', 'Engineering'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2028 },
    perks: ['Competitive Salary', 'Visa Sponsorship'],
    skills: ['Python', 'Statistics', 'Machine Learning'],
    highlySelective: false,
    description: "D.E. Shaw's quant analyst interns join one of the firm's systematic investment teams to research and prototype signals used in live trading strategies. The role is deliberately open to any highly quantitative background — you don't need finance experience, just the ability to formulate a rigorous hypothesis, test it against real data, and communicate the result clearly.",
    timeline: [
      { phase: 'Week 1', detail: "Onboarding into D.E. Shaw's research infrastructure, data libraries, and statistical toolkit." },
      { phase: 'Weeks 2–3', detail: "Paired research with a mentor analyst to learn the team's existing models and data sources." },
      { phase: 'Weeks 4–9', detail: 'Own research project: identify, test, and document a candidate signal or model improvement.' },
      { phase: 'Week 10', detail: 'Present findings to the investment team and receive feedback on full-time fit.' },
    ],
    interviewProcess: [
      'Online technical assessment: statistics, probability, and coding',
      'First-round technical phone interview',
      'Final round: 4–5 interviews covering math, coding, and research case studies',
      'Offer decision',
    ],
  },
  {
    id: 'citadel-qr',
    firm: 'Citadel',
    role: 'Quantitative Researcher Intern',
    cycle: 'Summer 2027',
    category: 'research',
    location: 'New York, NY / Miami, FL',
    degreeLevels: ['BS', 'MS', 'PhD'],
    phdOnly: false,
    majors: ['Mathematics', 'Statistics', 'Computer Science', 'Physics', 'Financial Engineering'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2028 },
    perks: ['Highly Competitive Salary', 'Housing Covered', 'Visa Sponsorship'],
    skills: ['Python', 'C++', 'Machine Learning', 'Probability'],
    highlySelective: true,
    description: "Citadel's Quantitative Researcher interns work within one of the firm's fundamental or systematic trading teams to build alpha-generating models used in live portfolios. This is one of the most selective quant internships in the industry — interns are expected to already be comfortable with advanced statistics, machine learning, and production-quality Python or C++, and the bar for full-time conversion is high.",
    timeline: [
      { phase: 'Week 1', detail: "Firm-wide orientation and a technical bootcamp covering Citadel's research stack." },
      { phase: 'Weeks 2–3', detail: 'Embedded with a live investment team, reviewing existing models and current market context.' },
      { phase: 'Weeks 4–9', detail: 'Independent alpha research project with regular check-ins from a senior researcher.' },
      { phase: 'Week 10', detail: 'Formal presentation to portfolio managers and researchers, feeding directly into return offers.' },
    ],
    interviewProcess: [
      'Online quantitative and coding assessment',
      'First-round interview: advanced probability, statistics, and coding',
      'Multiple final-round interviews with researchers and portfolio managers',
      'Case-style research discussion and final decision',
    ],
  },
  {
    id: 'citsec-qt',
    firm: 'Citadel Securities',
    role: 'Quantitative Trader Intern',
    cycle: 'Summer 2027',
    category: 'trading',
    location: 'New York, NY / Chicago, IL',
    degreeLevels: ['BS', 'MS'],
    phdOnly: false,
    majors: ['Mathematics', 'Statistics', 'Computer Science', 'Economics', 'Physics'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2028 },
    perks: ['Highly Competitive Salary', 'Housing Covered'],
    skills: ['Probability', 'Mental Math', 'Python'],
    highlySelective: false,
    description: "As a Quantitative Trader intern at Citadel Securities, you'll work on a live market-making desk, learning to price and hedge risk in real time across equities, options, or fixed income. The internship blends structured classroom training with real trading responsibility, and interns are evaluated continuously for a full-time trading offer.",
    timeline: [
      { phase: 'Week 1', detail: "Trading bootcamp: market microstructure, pricing theory, and Citadel Securities' internal tools." },
      { phase: 'Weeks 2–4', detail: 'Desk rotation shadowing traders and running paper-trading simulations.' },
      { phase: 'Weeks 5–9', detail: 'Live trading responsibility on a real book under close supervision from a mentor trader.' },
      { phase: 'Week 10', detail: 'Final trading review and full-time offer discussions with desk leadership.' },
    ],
    interviewProcess: [
      'Online mental math and probability assessment',
      'First-round interview with a trader on the desk',
      'Superday: back-to-back trading and behavioral interviews',
      'Offer decision, typically within 1–2 weeks',
    ],
  },
  {
    id: 'fiverings-qt',
    firm: 'Five Rings',
    role: 'Quantitative Trader Intern',
    cycle: 'Summer 2027',
    category: 'trading',
    location: 'New York, NY',
    degreeLevels: ['BS', 'MS'],
    phdOnly: false,
    majors: ['Mathematics', 'Physics', 'Computer Science', 'Statistics'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2028 },
    perks: ['Competitive Salary'],
    skills: ['Probability', 'Combinatorics', 'Basic Programming'],
    highlySelective: false,
    description: 'Five Rings is a small, close-knit proprietary trading firm that hires almost exclusively on raw problem-solving ability. Interns spend the summer working through real trading and market-making problems alongside a small team of traders, with an emphasis on clean probabilistic thinking over any specific programming language or finance background. Basic scripting ability is expected, but deep software engineering experience is not required.',
    timeline: [
      { phase: 'Week 1', detail: 'Intensive training on probability, expected value, and market-making fundamentals.' },
      { phase: 'Weeks 2–5', detail: 'Small-group problem sets and trading simulations reviewed directly by senior traders.' },
      { phase: 'Weeks 6–9', detail: 'Live-market rotation with a mentor trader on a real, closely monitored book.' },
      { phase: 'Week 10', detail: 'Final review session and full-time offer conversations with the trading team.' },
    ],
    interviewProcess: [
      'Online math and probability assessment',
      'First-round phone interview: probability puzzles and estimation problems',
      'Final round: in-person problem-solving interviews with multiple traders',
      'Offer decision',
    ],
  },
  {
    id: 'twosigma-dev',
    firm: 'Two Sigma',
    role: 'Quantitative Developer Intern',
    cycle: 'Summer 2027',
    category: 'developer',
    location: 'New York, NY',
    degreeLevels: ['BS', 'MS'],
    phdOnly: false,
    majors: ['Computer Science', 'Computer Engineering', 'Mathematics'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2028 },
    perks: ['Competitive Salary', 'Mentorship Program'],
    skills: ['C++', 'Python', 'Distributed Systems', 'Data Structures'],
    highlySelective: false,
    description: "Two Sigma's Quantitative Developer interns build the low-latency infrastructure and distributed systems that power the firm's research and trading platforms. You won't be building trading signals directly — instead you'll ship production code that researchers and traders rely on daily, working in small teams alongside senior engineers on real infrastructure projects.",
    timeline: [
      { phase: 'Week 1', detail: 'Engineering onboarding: codebase walkthroughs, internal tooling, and system design principles.' },
      { phase: 'Weeks 2–3', detail: 'Paired programming with a mentor engineer on an active infrastructure project.' },
      { phase: 'Weeks 4–9', detail: 'Own a scoped engineering project end-to-end, from design doc through code review and deployment.' },
      { phase: 'Week 10', detail: 'Final project demo to the engineering team and a feedback session for full-time consideration.' },
    ],
    interviewProcess: [
      'Online coding assessment (data structures & algorithms)',
      'First-round technical phone interview',
      'Final round: system design and coding interviews with engineers',
      'Offer decision',
    ],
  },
  {
    id: 'jump-phd',
    firm: 'Jump Trading',
    role: 'Quantitative Researcher (PhD Track) Intern',
    cycle: 'Summer 2027',
    category: 'research',
    location: 'Chicago, IL',
    degreeLevels: ['PhD'],
    phdOnly: true,
    majors: ['Mathematics', 'Physics', 'Statistics', 'Computer Science'],
    gradWindowStart: { month: 12, year: 2027 },
    gradWindowEnd: { month: 6, year: 2029 },
    perks: ['Highly Competitive Salary', 'Housing Covered', 'Visa Sponsorship'],
    skills: ['Advanced Statistics', 'Machine Learning', 'C++', 'Research Publication Experience'],
    highlySelective: true,
    description: "Jump's PhD-track research internship is built for candidates with deep academic research experience — typically in applied math, physics, or statistics — who want to apply rigorous modeling techniques to live financial markets. Interns work on open-ended research problems similar in spirit to a PhD thesis, but with immediate feedback from real market data and experienced quant researchers.",
    timeline: [
      { phase: 'Week 1', detail: "Research onboarding: Jump's data infrastructure, research tooling, and current open problems." },
      { phase: 'Weeks 2–3', detail: 'Literature-review-style deep dive into an assigned research area with a senior researcher mentor.' },
      { phase: 'Weeks 4–9', detail: 'Independent research project mirroring an academic research cycle: hypothesis, experimentation, and writeup.' },
      { phase: 'Week 10', detail: 'Formal research presentation to the quant research team and a full-time discussion.' },
    ],
    interviewProcess: [
      'Resume and research statement review',
      'Technical phone interview covering your research background and core math/stats',
      'Final round: multiple interviews with researchers, including an open-ended research discussion',
      'Offer decision',
    ],
  },
];

JOBS.forEach(job => {
  job.startVal = job.gradWindowStart.year * 12 + job.gradWindowStart.month;
  job.endVal = job.gradWindowEnd.year * 12 + job.gradWindowEnd.month;
});

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  currentUser = await Auth.fetchMe();
  updateNavUser();
  loadProfile();
  applyCategoryFromHash();
  render();
}

function applyCategoryFromHash() {
  const hashCategory = window.location.hash.slice(1);
  if (['research', 'trading', 'developer'].includes(hashCategory)) {
    STATE.view = 'discover';
    STATE.activeCategory = hashCategory;
    return;
  }
  STATE.activeCategory = null;
}

window.addEventListener('hashchange', () => { applyCategoryFromHash(); render(); });

function onAuthChanged() {
  loadProfile();
  render();
}

function updateNavUser() {
  const nameEl = document.getElementById('nav-username');
  const loginEl = document.getElementById('nav-login');
  const menuName = document.getElementById('profile-menu-name');
  const menuElo = document.getElementById('profile-menu-elo');
  if (currentUser) {
    if (nameEl) { nameEl.style.display = 'flex'; nameEl.textContent = currentUser.username.charAt(0).toUpperCase(); }
    if (loginEl) loginEl.style.display = 'none';
    if (menuName) menuName.textContent = currentUser.username;
    if (menuElo) menuElo.textContent = `${currentUser.elo.toLocaleString()} ELO`;
  } else {
    if (nameEl) nameEl.style.display = 'none';
    if (loginEl) loginEl.style.display = '';
  }
}

// ── PROFILE PERSISTENCE ───────────────────────────────────────────────────────
function profileKey() {
  return `careers_profile_${(currentUser?.username || 'guest').toLowerCase()}`;
}

function defaultCareerState() {
  return { ...DEFAULT_PROFILE, applications: {} };
}

function loadProfile() {
  const defaults = defaultCareerState();
  
  if (!currentUser) {
    STATE.profile = { ...DEFAULT_PROFILE };
    STATE.applications = {};
    return;
  }
  
  // Lazy hydrate from localStorage with proper schema validation
  try {
    const raw = localStorage.getItem(profileKey());
    if (!raw) {
      STATE.profile = { ...DEFAULT_PROFILE };
      STATE.applications = {};
      logProfileEngine(`No saved career profile for user: ${currentUser.username}, using defaults`);
      return;
    }
    
    const parsed = JSON.parse(raw);
    const { applications, ...profileFields } = parsed;
    
    // Merge with defaults to handle schema changes
    STATE.profile = { ...DEFAULT_PROFILE, ...profileFields };
    STATE.applications = (applications && typeof applications === 'object') ? applications : {};
    
    logProfileEngine(`Hydrated career profile for user: ${currentUser.username}`, { applications: Object.keys(STATE.applications).length });
  } catch (error) {
    console.error('[Profile Engine] Failed to load career profile:', error);
    STATE.profile = { ...DEFAULT_PROFILE };
    STATE.applications = {};
  }
}

function saveProfile() {
  if (!currentUser) return;
  persistToStorage(profileKey(), { ...STATE.profile, applications: STATE.applications }, defaultCareerState());
}

function updateProfileField(field, value) {
  STATE.profile[field] = value;
  saveProfile();
  // Skip re-rendering for free-text typing so the input never loses focus mid-keystroke.
  if (field !== 'major') render();
}

// ── MATCHING ──────────────────────────────────────────────────────────────────
function degreeBucket(level) {
  if (level === 'Ph.D.') return 'PhD';
  if (level === 'M.S.' || level === 'MFE') return 'MS';
  return 'BS';
}

function computeMatchStatus(job) {
  const { degreeLevel, yearInSchool, gradMonthValue } = STATE.profile;
  if (!gradMonthValue) return 'unknown';

  const bucket = degreeBucket(degreeLevel);
  if (!job.degreeLevels.includes(bucket)) return 'blocked';

  const [gy, gm] = gradMonthValue.split('-').map(Number);
  const gradVal = gy * 12 + gm;
  if (gradVal < job.startVal || gradVal > job.endVal) return 'mismatch';

  const underclassman = yearInSchool === 'Freshman' || yearInSchool === 'Sophomore';
  if (job.highlySelective || underclassman) return 'reach';
  return 'perfect';
}

const STATUS_META = {
  perfect: { label: '✅ Perfect Match', cls: 'perfect' },
  reach: { label: '🎯 Reach', cls: 'reach' },
  mismatch: { label: '⏳ Timing Off', cls: 'mismatch' },
  blocked: { label: '🎓 Ph.D. Required', cls: 'blocked' },
};

const STATUS_WEIGHT = { perfect: 0, unknown: 1, reach: 1, mismatch: 2, blocked: 3 };

function getFilteredSortedEntries() {
  const q = STATE.search.trim().toLowerCase();
  const entries = JOBS
    .filter(job => {
      if (q && !(job.firm.toLowerCase().includes(q) || job.role.toLowerCase().includes(q))) return false;
      if (STATE.activeCategory && job.category !== STATE.activeCategory) return false;
      if (STATE.phdOnlyFilter && !job.phdOnly) return false;
      return true;
    })
    .map(job => ({ job, status: computeMatchStatus(job) }));
  entries.sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]);
  return entries;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function escapeAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatGradDate(value) {
  if (!value) return '';
  const [y, m] = value.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m - 1]} ${y}`;
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    ${renderViewTabs()}
    ${STATE.view === 'tracker' ? renderTrackerView() : renderDiscoverView()}
  `;
}

function setView(v) {
  STATE.view = v;
  STATE.expandedAppId = null;
  render();
}

function renderViewTabs() {
  const count = Object.keys(STATE.applications).length;
  return `
  <div class="cr-view-tabs">
    <button class="cr-tag-btn ${STATE.view === 'discover' ? 'active' : ''}" onclick="setView('discover')">🔍 Discover Board</button>
    <button class="cr-tag-btn ${STATE.view === 'tracker' ? 'active' : ''}" onclick="setView('tracker')">📌 My Tracker${count ? ` (${count})` : ''}</button>
  </div>`;
}

function renderDiscoverView() {
  return `
    <div class="cr-layout">
      <div class="cr-header">
        <div class="section-tag">Jobs</div>
        <h2 style="margin-bottom:6px">Quant Finance Internship Matcher</h2>
        <p style="color:var(--t2);font-size:0.9rem">Fill out your academic profile and instantly see which Summer 2027 quant internships you're eligible for.</p>
      </div>
      ${renderProfilePanel()}
      <div>
        ${renderDashboardTop()}
        <div id="cr-job-grid">${renderJobGridHTML()}</div>
      </div>
    </div>
  `;
}

function renderProfilePanel() {
  const p = STATE.profile;
  const degrees = ['B.S.', 'B.A.', 'M.S.', 'MFE', 'Ph.D.', 'Other'];
  const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'];
  return `
  <div class="cr-profile">
    <div class="section-tag" style="margin-bottom:14px">Academic Profile</div>

    <div class="cr-field">
      <label class="cr-label" for="cr-degree">Degree Level</label>
      <select class="cr-select" id="cr-degree" onchange="updateProfileField('degreeLevel', this.value)">
        ${degrees.map(d => `<option value="${d}" ${p.degreeLevel === d ? 'selected' : ''}>${d}</option>`).join('')}
      </select>
    </div>

    <div class="cr-field">
      <label class="cr-label" for="cr-major">Major / Field of Study</label>
      <input class="cr-input" id="cr-major" list="cr-majors-list" autocomplete="off"
        value="${escapeAttr(p.major)}" placeholder="e.g. Mathematics" oninput="updateProfileField('major', this.value)" />
      <datalist id="cr-majors-list">${MAJOR_SUGGESTIONS.map(m => `<option value="${m}"></option>`).join('')}</datalist>
    </div>

    <div class="cr-field">
      <label class="cr-label" for="cr-year">Current Year</label>
      <select class="cr-select" id="cr-year" onchange="updateProfileField('yearInSchool', this.value)">
        ${years.map(y => `<option value="${y}" ${p.yearInSchool === y ? 'selected' : ''}>${y}</option>`).join('')}
      </select>
    </div>

    <div class="cr-field">
      <label class="cr-label" for="cr-grad">Expected Graduation</label>
      <input class="cr-input" type="month" id="cr-grad" value="${p.gradMonthValue}" onchange="updateProfileField('gradMonthValue', this.value)" />
      ${p.gradMonthValue ? `<div class="cr-grad-preview">→ ${formatGradDate(p.gradMonthValue)}</div>` : ''}
    </div>

    <div class="cr-field">
      <label class="cr-label">Degree Status</label>
      <div class="cr-toggle-row">
        <button class="cr-toggle-btn ${p.status === 'In Progress' ? 'active' : ''}" onclick="updateProfileField('status','In Progress')">In Progress</button>
        <button class="cr-toggle-btn ${p.status === 'Completed' ? 'active' : ''}" onclick="updateProfileField('status','Completed')">Completed</button>
      </div>
    </div>

    <p class="cr-profile-note">${currentUser ? 'Your profile is saved to this browser.' : 'Log in from the nav above to keep your profile saved across visits.'}</p>
  </div>`;
}

function renderDashboardTop() {
  const cats = [
    { key: 'research', label: 'Research' },
    { key: 'trading', label: 'Trading' },
    { key: 'developer', label: 'Developer' },
  ];
  return `
  <div class="cr-dash-top">
    <div class="cr-search">
      <input id="cr-search-input" type="text" placeholder="Search by firm or role..."
        value="${escapeAttr(STATE.search)}" oninput="updateSearch(this.value)" />
    </div>
    <div class="cr-tag-row">
      ${cats.map(c => `<button class="cr-tag-btn ${STATE.activeCategory === c.key ? 'active' : ''}" onclick="toggleCategory('${c.key}')">${c.label}</button>`).join('')}
      <button class="cr-tag-btn phd ${STATE.phdOnlyFilter ? 'active' : ''}" onclick="togglePhdFilter()">Ph.D. Only</button>
    </div>
  </div>`;
}

function renderJobGridHTML() {
  const entries = getFilteredSortedEntries();
  const countLine = `<div class="cr-count">${entries.length} internship${entries.length === 1 ? '' : 's'} found</div>`;
  if (!entries.length) {
    return countLine + `<div class="cr-empty">No internships match your search or filters. Try clearing one.</div>`;
  }
  const cards = entries.map(({ job, status }) => renderJobCard(job, status)).join('');
  return countLine + `<div class="cr-grid">${cards}</div>`;
}

function renderJobCard(job, status) {
  const meta = STATUS_META[status];
  const dimmed = (status === 'blocked' || status === 'mismatch') ? 'dimmed' : '';
  const gradRange = job.gradWindowStart.year === job.gradWindowEnd.year
    ? `Class of ${job.gradWindowStart.year}`
    : `Class of ${job.gradWindowStart.year}–${job.gradWindowEnd.year}`;
  return `
  <div class="cr-card ${dimmed}" role="button" tabindex="0" aria-label="${job.firm} — ${job.role}"
    onclick="openJob('${job.id}')" onkeydown="if(event.key==='Enter')openJob('${job.id}')">
    ${meta ? `<div class="cr-status-pill ${meta.cls}">${meta.label}</div>` : ''}
    <div class="cr-card-top-row">
      <button class="cr-save-btn ${isSaved(job.id) ? 'saved' : ''}" onclick="toggleSaveJob('${job.id}', event)" aria-label="${isSaved(job.id) ? 'Remove from tracker' : 'Save to tracker'}">${isSaved(job.id) ? '🔖' : '📑'}</button>
      <div class="cr-card-firm">${job.firm}</div>
    </div>
    <div class="cr-card-role">${job.role}</div>
    <div class="cr-card-row">🎓 ${gradRange}</div>
    <div class="cr-card-row">📍 ${job.location}</div>
    <div class="cr-card-perks">${job.perks.map(p => `<span class="cr-perk-badge">${p}</span>`).join('')}</div>
    <div class="cr-card-skills">${job.skills.map(s => `<span class="cr-skill-chip">${s}</span>`).join('')}</div>
  </div>`;
}

function renderSlideoverContent(job) {
  const applyUrl = `https://www.google.com/search?q=${encodeURIComponent(`${job.firm} ${job.role} apply`)}`;
  const gradRange = job.gradWindowStart.year === job.gradWindowEnd.year
    ? `Class of ${job.gradWindowStart.year}`
    : `Class of ${job.gradWindowStart.year}–${job.gradWindowEnd.year}`;
  return `
    <button class="cr-slideover-close" onclick="closeJob()" aria-label="Close">✕</button>
    <div class="cr-so-firm">${job.firm} · ${job.cycle}</div>
    <div class="cr-so-role">${job.role}</div>
    <div class="cr-so-meta">
      <span>📍 ${job.location}</span>
      <span>🎓 ${gradRange}</span>
    </div>
    <div class="cr-card-perks">${job.perks.map(p => `<span class="cr-perk-badge">${p}</span>`).join('')}</div>

    <div class="cr-so-section-label">About the Role</div>
    <div class="cr-so-desc">${job.description}</div>

    <div class="cr-so-section-label">Recommended Coursework &amp; Skills</div>
    <div class="cr-card-skills">${job.skills.map(s => `<span class="cr-skill-chip">${s}</span>`).join('')}</div>

    <div class="cr-so-section-label">Internship Structure</div>
    ${job.timeline.map(t => `
      <div class="cr-timeline-step">
        <div class="cr-timeline-dot"></div>
        <div>
          <div class="cr-timeline-phase">${t.phase}</div>
          <div class="cr-timeline-detail">${t.detail}</div>
        </div>
      </div>`).join('')}

    <div class="cr-so-section-label">Interview Process</div>
    ${job.interviewProcess.map((step, i) => `
      <div class="cr-interview-step">
        <div class="cr-interview-num">${i + 1}</div>
        <div>${step}</div>
      </div>`).join('')}

    <div class="cr-so-actions">
      <button class="btn btn-outline" id="cr-save-slideover-btn" onclick="toggleSaveJob('${job.id}')">${isSaved(job.id) ? '🔖 Saved to Tracker' : '📑 Save to Tracker'}</button>
      <a class="btn btn-primary cr-apply-btn" href="${applyUrl}" target="_blank" rel="noopener noreferrer">Apply Now →</a>
    </div>
  `;
}

// ── INTERACTIONS ──────────────────────────────────────────────────────────────
function updateSearch(value) {
  STATE.search = value;
  const grid = document.getElementById('cr-job-grid');
  if (grid) grid.innerHTML = renderJobGridHTML();
}

function toggleCategory(cat) {
  STATE.activeCategory = STATE.activeCategory === cat ? null : cat;
  render();
}

function togglePhdFilter() {
  STATE.phdOnlyFilter = !STATE.phdOnlyFilter;
  render();
}

function isSaved(jobId) {
  return !!STATE.applications[jobId];
}

function toggleSaveJob(jobId, e) {
  if (e) e.stopPropagation(); // don't also trigger the card's onclick (openJob)
  if (STATE.applications[jobId]) {
    delete STATE.applications[jobId];
  } else {
    const job = JOBS.find(j => j.id === jobId);
    if (!job) return;
    STATE.applications[jobId] = {
      jobId,
      company: job.firm,
      role: `${job.role} (${job.cycle})`,
      status: 'To Do',
      outcome: null,
      interviewReceived: false,
      currentRound: null,
      notes: '',
      updatedAt: new Date().toISOString(),
    };
  }
  saveProfile();
  render();

  // If the slide-over is open for this exact job, refresh it too — it lives
  // outside #app so the render() above doesn't touch it.
  if (STATE.openJobId === jobId) {
    const job = JOBS.find(j => j.id === jobId);
    const slideover = document.getElementById('cr-slideover');
    if (job && slideover) slideover.innerHTML = renderSlideoverContent(job);
  }
}

function openJob(id) {
  const job = JOBS.find(j => j.id === id);
  if (!job) return;
  STATE.openJobId = id;

  const slideover = document.getElementById('cr-slideover');
  const backdrop = document.getElementById('cr-backdrop');
  if (!slideover || !backdrop) return;
  slideover.innerHTML = renderSlideoverContent(job);

  // Set content first, then open on the next frame so the browser registers
  // the closed position and the slide-in transition actually plays.
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    slideover.classList.add('open');
  });
  document.body.style.overflow = 'hidden';
}

function closeJob() {
  STATE.openJobId = null;
  const slideover = document.getElementById('cr-slideover');
  const backdrop = document.getElementById('cr-backdrop');
  if (slideover) slideover.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ── TRACKER ───────────────────────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return `${Math.floor(day / 30)}mo ago`;
}

function computeColumn(a) {
  if (a.status === 'To Do') return 'todo';
  if (a.outcome === 'Accepted') return 'offer';
  if (a.outcome === 'Denied') return 'denied';
  if (a.interviewReceived) return 'interviewing';
  return 'applied';
}

function renderTrackerView() {
  const apps = Object.values(STATE.applications);
  const guestNote = currentUser ? '' : `<p style="color:var(--t3);font-size:0.82rem;margin-bottom:20px">Log in from the nav above to keep your tracker saved across visits.</p>`;
  return `
  <div class="cr-layout" style="grid-template-columns:1fr">
    <div class="cr-header">
      <div class="section-tag">My Tracker</div>
      <h2 style="margin-bottom:6px">Your application pipeline</h2>
      <p style="color:var(--t2);font-size:0.9rem">Track every internship from first interest through offer.</p>
      ${guestNote}
    </div>
    ${renderMetricsBar(apps)}
    ${renderAddCustomForm()}
    ${renderPipelineBoard(apps)}
  </div>`;
}

function renderMetricsBar(apps) {
  const totalSaved = apps.filter(a => a.status === 'To Do').length;
  const appliedApps = apps.filter(a => a.status === 'Applied');
  const active = appliedApps.filter(a => a.outcome === 'Pending').length;
  const interviews = apps.filter(a => a.interviewReceived).length;
  const interviewRate = appliedApps.length ? Math.round((interviews / appliedApps.length) * 100) : 0;
  const offers = apps.filter(a => a.outcome === 'Accepted').length;
  return `
  <div class="cr-metrics-bar">
    <div class="cr-metric">
      <div class="cr-metric-value">${totalSaved}</div>
      <div class="cr-metric-label">Total Saved</div>
    </div>
    <div class="cr-metric">
      <div class="cr-metric-value">${active}</div>
      <div class="cr-metric-label">Active Applications</div>
    </div>
    <div class="cr-metric">
      <div class="cr-metric-value">${interviews}<span class="cr-metric-sub">${interviewRate}%</span></div>
      <div class="cr-metric-label">Interviews Secured</div>
    </div>
    <div class="cr-metric offer">
      <div class="cr-metric-value">${offers}</div>
      <div class="cr-metric-label">Offers</div>
    </div>
  </div>`;
}

function renderAddCustomForm() {
  return `
  <div class="cr-add-custom">
    <input id="cr-custom-company" class="cr-input" placeholder="Company" />
    <input id="cr-custom-role" class="cr-input" placeholder="Role" />
    <button class="btn btn-outline" onclick="addCustomApplication()">+ Add Application</button>
  </div>`;
}

function addCustomApplication() {
  const companyEl = document.getElementById('cr-custom-company');
  const roleEl = document.getElementById('cr-custom-role');
  const company = (companyEl?.value || '').trim();
  const role = (roleEl?.value || '').trim();
  if (!company || !role) { window.alert('Enter both a company and a role.'); return; }
  const jobId = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  STATE.applications[jobId] = {
    jobId, company, role,
    status: 'To Do', outcome: null, interviewReceived: false, currentRound: null,
    notes: '', updatedAt: new Date().toISOString(),
  };
  saveProfile();
  render();
}

function renderPipelineBoard(apps) {
  if (!apps.length) {
    return `<div class="cr-empty" style="margin-top:4px">No saved applications yet. Head to the Discover Board and save an internship, or add a custom one above, to start tracking it here.</div>`;
  }
  const byColumn = {};
  PIPELINE_COLUMNS.forEach(c => { byColumn[c.key] = []; });
  apps.forEach(a => byColumn[computeColumn(a)].push(a));

  return `
  <div class="cr-board">
    ${PIPELINE_COLUMNS.map(col => `
      <div class="cr-board-col">
        <div class="cr-board-col-header">${col.icon} ${col.label} <span class="cr-board-col-count">${byColumn[col.key].length}</span></div>
        <div class="cr-board-col-body">
          ${byColumn[col.key].length ? byColumn[col.key].map(a => renderAppCard(a)).join('') : `<div class="cr-board-empty">—</div>`}
        </div>
      </div>`).join('')}
  </div>`;
}

function renderAppCard(a) {
  const expanded = STATE.expandedAppId === a.jobId;
  const roundBadge = a.interviewReceived && a.currentRound ? `<div class="cr-app-round">${a.currentRound}</div>` : '';
  return `
  <div class="cr-app-card ${expanded ? 'expanded' : ''}">
    <div class="cr-app-card-head" onclick="toggleExpandApp('${a.jobId}')">
      <div>
        <div class="cr-app-company">${a.company}</div>
        <div class="cr-app-role">${a.role}</div>
        ${roundBadge}
      </div>
      <div class="cr-app-chevron">${expanded ? '▲' : '▼'}</div>
    </div>
    ${expanded ? renderAppCardBody(a) : ''}
  </div>`;
}

function renderAppCardBody(a) {
  return `
  <div class="cr-app-card-body">
    <div class="cr-app-row">
      <label class="cr-label">Status</label>
      <div class="cr-toggle-row">
        <button class="cr-toggle-btn ${a.status === 'To Do' ? 'active' : ''}" onclick="updateAppField('${a.jobId}','status','To Do')">To Do</button>
        <button class="cr-toggle-btn ${a.status === 'Applied' ? 'active' : ''}" onclick="updateAppField('${a.jobId}','status','Applied')">Applied</button>
      </div>
    </div>
    ${a.status === 'Applied' ? `
      <div class="cr-app-row">
        <label class="cr-label">Application Outcome</label>
        <select class="cr-select" onchange="updateAppField('${a.jobId}','outcome', this.value)">
          ${OUTCOME_OPTIONS.map(o => `<option value="${o}" ${a.outcome === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </div>
      <div class="cr-app-row">
        <label class="cr-label">Interview Received?</label>
        <div class="cr-toggle-row">
          <button class="cr-toggle-btn ${a.interviewReceived ? 'active' : ''}" onclick="updateAppField('${a.jobId}','interviewReceived', true)">Yes</button>
          <button class="cr-toggle-btn ${!a.interviewReceived ? 'active' : ''}" onclick="updateAppField('${a.jobId}','interviewReceived', false)">No</button>
        </div>
      </div>
      ${a.interviewReceived ? `
        <div class="cr-app-row">
          <label class="cr-label">Interview Round</label>
          <select class="cr-select" onchange="updateAppField('${a.jobId}','currentRound', this.value)">
            ${INTERVIEW_ROUNDS.map(r => `<option value="${r}" ${a.currentRound === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>` : ''}
    ` : ''}
    <div class="cr-app-row">
      <label class="cr-label">Notes</label>
      <textarea class="cr-notes" oninput="updateNotes('${a.jobId}', this.value)" placeholder="Quick prep notes, recruiter contacts, deadlines...">${escapeAttr(a.notes || '')}</textarea>
      <div class="cr-notes-updated" id="app-updated-${a.jobId}">Last updated ${relativeTime(a.updatedAt)}</div>
    </div>
    <button class="cr-remove-btn" onclick="removeApplication('${a.jobId}')">🗑 Remove from Tracker</button>
  </div>`;
}

function toggleExpandApp(jobId) {
  STATE.expandedAppId = STATE.expandedAppId === jobId ? null : jobId;
  render();
}

function updateAppField(jobId, field, value) {
  const a = STATE.applications[jobId];
  if (!a) return;
  a[field] = value;
  if (field === 'status' && value === 'To Do') {
    a.outcome = null; a.interviewReceived = false; a.currentRound = null;
  }
  if (field === 'status' && value === 'Applied' && !a.outcome) {
    a.outcome = 'Pending';
  }
  if (field === 'interviewReceived' && value === false) {
    a.currentRound = null;
  }
  a.updatedAt = new Date().toISOString();
  saveProfile();
  render();
}

let notesDebounceTimer = null;
function updateNotes(jobId, value) {
  const a = STATE.applications[jobId];
  if (!a) return;
  a.notes = value;
  clearTimeout(notesDebounceTimer);
  notesDebounceTimer = setTimeout(() => {
    a.updatedAt = new Date().toISOString();
    saveProfile();
    const ts = document.getElementById(`app-updated-${jobId}`);
    if (ts) ts.textContent = `Last updated ${relativeTime(a.updatedAt)}`;
  }, 600);
}

function removeApplication(jobId) {
  if (!window.confirm('Remove this application from your tracker? This cannot be undone.')) return;
  delete STATE.applications[jobId];
  if (STATE.expandedAppId === jobId) STATE.expandedAppId = null;
  saveProfile();
  render();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && STATE.openJobId) closeJob();
});

init();
