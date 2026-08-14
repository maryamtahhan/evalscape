'use strict';

/* ============================================================
   Constants
   ============================================================ */
const USE_CASE_LABELS = {
  'pre-production':    'Pre-production',
  'ci-friendly':       'CI-friendly',
  'leaderboard':       'Leaderboard',
  'production-monitoring': 'Production monitoring',
  'research':          'Research',
  'api-benchmarking':  'API benchmarking',
  'cost-analysis':     'Cost analysis',
};

const STATUS_LABELS = {
  active:       'Active',
  experimental: 'Experimental',
  archived:     'Archived',
};

const STANDARD_TYPE_LABELS = {
  benchmark:     'Benchmark',
  governance:    'Governance',
  regulation:    'Regulation',
  specification: 'Specification',
};

const STANDARD_TYPE_CLASS = {
  benchmark:     'std-benchmark',
  governance:    'std-governance',
  regulation:    'std-regulation',
  specification: 'std-spec',
};

const HOSTING_LABELS = {
  'self-hosted': 'Self-hosted',
  saas:          'SaaS',
  both:          'SaaS + self-hosted',
  library:       'Library',
};

const ADOPTION_LABELS = {
  research:   'Research',
  production: 'Production',
  both:       'Research & production',
};

const MODEL_SCOPE_LABELS = {
  agnostic:           'Model-agnostic',
  'openai-compatible': 'OpenAI-compatible APIs',
  huggingface:        'Hugging Face',
  'provider-specific': 'Provider-specific',
};

const WIZARD_GOALS = [
  { id: 'inference',  label: 'Inference performance', types: ['online', 'offline'] },
  { id: 'model-routing', label: 'LLM model routing', types: ['online', 'offline', 'multimodal'] },
  { id: 'quality',    label: 'Model quality & accuracy', types: ['quality'] },
  { id: 'code',       label: 'Code generation', types: ['code'] },
  { id: 'agent',      label: 'Agents & tool use', types: ['agent'] },
  { id: 'rag',        label: 'RAG & retrieval', types: ['rag', 'embedding'] },
  { id: 'audio',      label: 'Audio & speech', types: ['audio'] },
  { id: 'safety',     label: 'Safety & alignment', types: ['safety', 'security'] },
  { id: 'multimodal', label: 'Multimodal', types: ['multimodal'] },
];

const WIZARD_CONTEXTS = [
  { id: 'online',     label: 'Online serving / live API', types: ['online'] },
  { id: 'offline',    label: 'Offline batch evaluation', types: ['offline', 'quality'] },
  { id: 'monitoring', label: 'Production monitoring', useCases: ['production-monitoring'] },
  { id: 'research',   label: 'Research / leaderboard', useCases: ['leaderboard', 'research'] },
];

/* ============================================================
   State
   ============================================================ */
const state = {
  section:  'tools',
  hw:       'all',
  type:     'all',
  useCase:  'all',
  status:   'current',
  standardType: 'all',
  search:   '',
  view:     'comfy',
  sort:     'default',
  compare:  [],
};

let wizardStep = 0;
let wizardAnswers = {};
let suppressUrlSync = false;

/* ============================================================
   Helpers
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const getCategory = (id) => LANDSCAPE.categories.find((c) => c.id === id);
const getTool = (id) => LANDSCAPE.tools.find((t) => t.id === id);
const getLeaderboard = (id) => (LANDSCAPE.leaderboards || []).find((lb) => lb.id === id);
const getLeaderboards = () => LANDSCAPE.leaderboards || [];
const getStandard = (id) => (LANDSCAPE.standards || []).find((s) => s.id === id);
const getStandards = () => LANDSCAPE.standards || [];
const isToolsSection = () => state.section === 'tools';
const isLeaderboardsSection = () => state.section === 'leaderboards';
const isStandardsSection = () => state.section === 'standards';

const matchesStatusFilter = (item) => {
  const s = item.status || 'active';
  switch (state.status) {
    case 'all': return true;
    case 'current': return s !== 'archived';
    case 'active': return s === 'active';
    case 'experimental': return s === 'experimental';
    case 'archived': return s === 'archived';
    default: return true;
  }
};

const isFiltering = () => {
  if (isToolsSection() && state.hw !== 'all') return true;
  if (isStandardsSection() && state.standardType !== 'all') return true;
  if (state.type !== 'all') return true;
  if (!isStandardsSection() && state.useCase !== 'all') return true;
  if (state.status !== 'all') return true;
  if (state.search) return true;
  return false;
};

const isVisible = (tool) => {
  if (state.hw !== 'all') {
    const hasCpu = tool.hardware.includes('cpu');
    const hasGpu = tool.hardware.includes('gpu');
    if (state.hw === 'cpu'  && !hasCpu) return false;
    if (state.hw === 'gpu'  && !hasGpu) return false;
    if (state.hw === 'both' && !(hasCpu && hasGpu)) return false;
  }
  if (state.type !== 'all' && !tool.types.includes(state.type)) return false;
  if (state.useCase !== 'all' && !(tool.useCases || []).includes(state.useCase)) return false;
  if (!matchesStatusFilter(tool)) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    const haystack = [
      tool.name, tool.description, tool.org,
      ...(tool.tags || []), ...(tool.useCases || []).map((u) => USE_CASE_LABELS[u] || u),
      tool.foundation || '', tool.hosting || '', tool.modelScope || '', tool.adoption || '',
      ...(tool.outputFormats || []), ...(tool.datasets || []),
    ].join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

const isLeaderboardVisible = (lb) => {
  if (state.type !== 'all' && !lb.types.includes(state.type)) return false;
  if (state.useCase !== 'all' && !(lb.useCases || []).includes(state.useCase)) return false;
  if (!matchesStatusFilter(lb)) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    const haystack = [
      lb.name, lb.description, lb.org,
      ...(lb.tags || []), ...(lb.useCases || []).map((u) => USE_CASE_LABELS[u] || u),
    ].join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

const isStandardVisible = (std) => {
  if (state.standardType !== 'all' && std.standardType !== state.standardType) return false;
  if (state.type !== 'all' && !std.types.includes(state.type)) return false;
  if (!matchesStatusFilter(std)) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    const haystack = [
      std.name, std.description, std.org, std.conformance || '',
      STANDARD_TYPE_LABELS[std.standardType] || std.standardType,
      ...(std.tags || []),
    ].join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

const sortTools = (tools) => {
  const list = [...tools];
  if (state.sort === 'stars') {
    list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  } else if (state.sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === 'reviewed') {
    list.sort((a, b) => (b.lastReviewed || '').localeCompare(a.lastReviewed || ''));
  }
  return list;
};

const sortLeaderboards = (items) => {
  const list = [...items];
  if (state.sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === 'reviewed') {
    list.sort((a, b) => (b.lastReviewed || '').localeCompare(a.lastReviewed || ''));
  }
  return list;
};

const sortStandards = (items) => {
  const list = [...items];
  if (state.sort === 'year') {
    list.sort((a, b) => (b.year || 0) - (a.year || 0));
  } else if (state.sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === 'reviewed') {
    list.sort((a, b) => (b.lastReviewed || '').localeCompare(a.lastReviewed || ''));
  }
  return list;
};

const hasActiveFilters = isFiltering;

/* ============================================================
   URL state
   ============================================================ */
const syncUrl = () => {
  if (suppressUrlSync) return;
  const params = new URLSearchParams(window.location.search);
  if (state.hw !== 'all')       params.set('hw', state.hw);
  else                          params.delete('hw');
  if (state.type !== 'all')     params.set('type', state.type);
  else                          params.delete('type');
  if (state.useCase !== 'all')  params.set('useCase', state.useCase);
  else                          params.delete('useCase');
  if (state.status !== 'current') params.set('status', state.status);
  else                          params.delete('status');
  if (state.search)             params.set('q', state.search);
  else                          params.delete('q');
  if (state.view !== 'comfy')   params.set('view', state.view);
  else                          params.delete('view');
  if (state.sort !== 'default') params.set('sort', state.sort);
  else                          params.delete('sort');
  if (state.compare.length)     params.set('compare', state.compare.join(','));
  else                          params.delete('compare');
  if (state.section !== 'tools') params.set('section', state.section);
  else                           params.delete('section');
  if (state.standardType !== 'all') params.set('standardType', state.standardType);
  else                          params.delete('standardType');
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
};

const readUrl = () => {
  suppressUrlSync = true;
  const params = new URLSearchParams(window.location.search);
  if (params.get('hw'))       state.hw = params.get('hw');
  if (params.get('type'))     state.type = params.get('type');
  if (params.get('useCase'))  state.useCase = params.get('useCase');
  if (params.get('status'))   state.status = params.get('status');
  if (params.get('q'))        state.search = params.get('q');
  if (params.get('view'))     state.view = params.get('view');
  if (params.get('sort'))     state.sort = params.get('sort');
  if (params.get('compare')) {
    state.compare = params.get('compare').split(',').filter((id) => getTool(id)).slice(0, 3);
  }
  if (params.get('section') === 'leaderboards') state.section = 'leaderboards';
  else if (params.get('section') === 'standards') state.section = 'standards';
  if (params.get('standardType')) state.standardType = params.get('standardType');
  suppressUrlSync = false;
  return {
    tool: params.get('tool'),
    leaderboard: params.get('leaderboard'),
    standard: params.get('standard'),
  };
};

const setUrlTool = (toolId) => {
  const params = new URLSearchParams(window.location.search);
  if (toolId) {
    params.set('tool', toolId);
    params.delete('leaderboard');
    params.delete('standard');
  } else params.delete('tool');
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
};

const setUrlLeaderboard = (lbId) => {
  const params = new URLSearchParams(window.location.search);
  if (lbId) {
    params.set('leaderboard', lbId);
    params.delete('tool');
    params.delete('standard');
  } else params.delete('leaderboard');
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
};

const setUrlStandard = (standardId) => {
  const params = new URLSearchParams(window.location.search);
  if (standardId) {
    params.set('standard', standardId);
    params.delete('tool');
    params.delete('leaderboard');
  } else params.delete('standard');
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
};

/* ============================================================
   Badge renderers
   ============================================================ */
const HW_LABELS = { cpu: 'CPU', gpu: 'GPU' };
const TYPE_LABELS = {
  online: 'Online', offline: 'Offline', quality: 'LLM Quality', code: 'Code Gen',
  agent: 'Agent', rag: 'RAG', embedding: 'Embedding', audio: 'Audio',
  safety: 'Safety', multimodal: 'Multimodal', security: 'Security',
};
const TYPE_CLASS = {
  online: 't-online', offline: 't-offline', quality: 't-quality', code: 't-code',
  agent: 't-agent', rag: 't-rag', embedding: 't-emb', audio: 't-audio',
  safety: 't-safety', multimodal: 't-mm', security: 't-sec',
};

const hwBadge = (hw) => `<span class="badge hw-${hw}">${HW_LABELS[hw]}</span>`;
const typeBadge = (type) =>
  `<span class="badge ${TYPE_CLASS[type] || ''}">${TYPE_LABELS[type] || type}</span>`;
const useCaseBadge = (uc) =>
  `<span class="badge use-case">${USE_CASE_LABELS[uc] || uc}</span>`;
const statusBadge = (status) =>
  `<span class="badge status-${status}">${STATUS_LABELS[status] || status}</span>`;
const lbBadge = () => `<span class="badge lb-badge">Leaderboard</span>`;
const standardTypeBadge = (standardType) =>
  `<span class="badge ${STANDARD_TYPE_CLASS[standardType] || ''}">${STANDARD_TYPE_LABELS[standardType] || standardType}</span>`;

const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const starIcon = `<svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`;
const forkIcon = `<svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11" aria-hidden="true"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>`;
const extIcon = `<svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true"><path d="M6.22 8.72a.75.75 0 0 0 1.06 0l3.22-3.22v2.69a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.69L6.22 7.66a.75.75 0 0 0 0 1.06Z"/><path d="M3.5 6.75A.75.75 0 0 1 4.25 6h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 3.5 6.75Z"/></svg>`;

const statsRow = (tool) =>
  (tool.stars || tool.forks)
    ? `<div class="card-stats">
         <span class="stat-item">${starIcon}${fmtNum(tool.stars)}</span>
         <span class="stat-item">${forkIcon}${fmtNum(tool.forks)}</span>
       </div>`
    : '';

/* ============================================================
   Card templates
   ============================================================ */
const heroContent = (tool, initialsClass = 'card-initials') =>
  tool.logo
    ? `<img src="${tool.logo}" alt="${tool.name} logo" class="card-logo" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'${initialsClass}',textContent:'${tool.initials}'}))">`
    : `<span class="${initialsClass}">${tool.initials}</span>`;

const cardComfy = (tool, cat) => {
  const inCompare = state.compare.includes(tool.id);
  return `
  <div class="tool-card${isVisible(tool) ? '' : ' hidden'}${inCompare ? ' in-compare' : ''}"
       data-id="${tool.id}"
       data-kind="tool"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${tool.name}">
    <div class="card-hero">
      ${heroContent(tool)}
      ${tool.status && tool.status !== 'active' ? statusBadge(tool.status) : ''}
    </div>
    <div class="card-body">
      <div class="card-name">${tool.name}</div>
      <div class="card-desc">${tool.description}</div>
      <div class="card-badges">
        ${tool.hardware.map(hwBadge).join('')}
        ${tool.types.map(typeBadge).join('')}
        ${cardMetaBadges(tool)}
      </div>
      ${statsRow(tool)}
    </div>
  </div>`;
};

const cardDense = (tool, cat) => {
  const inCompare = state.compare.includes(tool.id);
  return `
  <div class="tool-card dense${isVisible(tool) ? '' : ' hidden'}${inCompare ? ' in-compare' : ''}"
       data-id="${tool.id}"
       data-kind="tool"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${tool.name}">
    <div class="card-hero-dense">
      ${heroContent(tool, 'card-initials-dense')}
    </div>
    <div class="card-name-dense">${tool.shortName}</div>
    <div class="card-badges-dense">${tool.hardware.map(hwBadge).join('')}</div>
  </div>`;
};

const lbCardComfy = (lb, cat) => `
  <div class="tool-card lb-card${isLeaderboardVisible(lb) ? '' : ' hidden'}"
       data-id="${lb.id}"
       data-kind="leaderboard"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${lb.name}">
    <div class="card-hero">
      ${heroContent(lb)}
      ${lbBadge()}
    </div>
    <div class="card-body">
      <div class="card-name">${lb.name}</div>
      <div class="card-desc">${lb.description}</div>
      <div class="card-badges">${lb.types.map(typeBadge).join('')}</div>
    </div>
  </div>`;

const lbCardDense = (lb, cat) => `
  <div class="tool-card dense lb-card${isLeaderboardVisible(lb) ? '' : ' hidden'}"
       data-id="${lb.id}"
       data-kind="leaderboard"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${lb.name}">
    <div class="card-hero-dense">
      ${heroContent(lb, 'card-initials-dense')}
    </div>
    <div class="card-name-dense">${lb.shortName}</div>
    <div class="card-badges-dense">${lb.types.slice(0, 1).map(typeBadge).join('')}</div>
  </div>`;

const cardMetaBadges = (tool) => {
  const badges = [];
  if (tool.hosting) badges.push(`<span class="badge meta-hosting">${HOSTING_LABELS[tool.hosting] || tool.hosting}</span>`);
  if (tool.foundation) badges.push(`<span class="badge meta-foundation">${tool.foundation}</span>`);
  return badges.length ? badges.join('') : '';
};

const standardSourceLink = (std) =>
  std.url
    ? `<a href="${std.url}" class="card-source-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${std.urlLabel || std.org || 'Official source'} ${extIcon}</a>`
    : '';

const standardCardComfy = (std, cat) => `
  <div class="tool-card standard-card${isStandardVisible(std) ? '' : ' hidden'}"
       data-id="${std.id}"
       data-kind="standard"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${std.name}">
    <div class="card-hero">
      ${heroContent(std)}
      ${standardTypeBadge(std.standardType)}
    </div>
    <div class="card-body">
      <div class="card-name">${std.name}</div>
      <div class="card-desc">${std.description}</div>
      ${standardSourceLink(std)}
      <div class="card-badges">
        ${std.types.map(typeBadge).join('')}
        ${std.year ? `<span class="badge std-year">${std.year}</span>` : ''}
      </div>
    </div>
  </div>`;

const standardCardDense = (std, cat) => `
  <div class="tool-card dense standard-card${isStandardVisible(std) ? '' : ' hidden'}"
       data-id="${std.id}"
       data-kind="standard"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${std.name}">
    <div class="card-hero-dense">
      ${heroContent(std, 'card-initials-dense')}
    </div>
    <div class="card-name-dense">${std.shortName}</div>
    <div class="card-badges-dense">${standardTypeBadge(std.standardType)}</div>
  </div>`;

const catEmoji = (id) => ({
  inference: '⚡', 'model-routing': '🔀', 'benchmark-orchestration': '🔁', quality: '📊', code: '💻', agent: '🤖', rag: '🔍',
  embedding: '🔢', audio: '🎙️', safety: '🛡️', multimodal: '🖼️', security: '🔒',
}[id] || '📊');

/* ============================================================
   Render
   ============================================================ */
const renderCards = () => {
  const main = $('#main-content');
  const mkCard = state.view === 'dense' ? cardDense : cardComfy;
  const filtering = hasActiveFilters();

  const sections = LANDSCAPE.categories
    .map((cat) => {
      const tools = sortTools(LANDSCAPE.tools.filter((t) => t.category === cat.id));
      const visible = tools.filter(isVisible);
      if (filtering && visible.length === 0) return '';
      return `
        <section class="cat-section" id="cat-${cat.id}" style="--cat-color:${cat.color}">
          <div class="cat-header">
            <div class="cat-icon" style="background:${cat.color}20; color:${cat.color}">
              ${catEmoji(cat.id)}
            </div>
            <div class="cat-meta">
              <h2 class="cat-title">${cat.name}</h2>
              <p class="cat-desc">${cat.description}</p>
            </div>
            <span class="cat-badge" id="badge-${cat.id}">${visible.length} / ${tools.length}</span>
          </div>
          <div class="cards-grid${state.view === 'dense' ? ' dense-grid' : ''}">
            ${tools.map((t) => mkCard(t, cat)).join('')}
          </div>
        </section>`;
    })
    .filter(Boolean)
    .join('');

  main.innerHTML = sections;
  attachCardHandlers();
  updateCounts();
  updateNoResults();
};

const renderLeaderboards = () => {
  const main = $('#main-content');
  const mkCard = state.view === 'dense' ? lbCardDense : lbCardComfy;
  const filtering = hasActiveFilters();

  const sections = LANDSCAPE.categories
    .map((cat) => {
      const boards = sortLeaderboards(getLeaderboards().filter((lb) => lb.category === cat.id));
      const visible = boards.filter(isLeaderboardVisible);
      if (filtering && visible.length === 0) return '';
      return `
        <section class="cat-section" id="cat-${cat.id}" style="--cat-color:${cat.color}">
          <div class="cat-header">
            <div class="cat-icon" style="background:${cat.color}20; color:${cat.color}">
              ${catEmoji(cat.id)}
            </div>
            <div class="cat-meta">
              <h2 class="cat-title">${cat.name}</h2>
              <p class="cat-desc">${cat.description}</p>
            </div>
            <span class="cat-badge" id="badge-${cat.id}">${visible.length} / ${boards.length}</span>
          </div>
          <div class="cards-grid${state.view === 'dense' ? ' dense-grid' : ''}">
            ${boards.map((lb) => mkCard(lb, cat)).join('')}
          </div>
        </section>`;
    })
    .filter(Boolean)
    .join('');

  main.innerHTML = sections;
  attachCardHandlers();
  updateCounts();
  updateNoResults();
};

const renderContent = () => {
  if (isToolsSection()) renderCards();
  else if (isLeaderboardsSection()) renderLeaderboards();
  else renderStandards();
  renderCatNav();
  updateSectionUI();
};

const renderStandards = () => {
  const main = $('#main-content');
  const mkCard = state.view === 'dense' ? standardCardDense : standardCardComfy;
  const filtering = hasActiveFilters();

  const sections = LANDSCAPE.categories
    .map((cat) => {
      const standards = sortStandards(getStandards().filter((s) => s.category === cat.id));
      const visible = standards.filter(isStandardVisible);
      if (filtering && visible.length === 0) return '';
      return `
        <section class="cat-section" id="cat-${cat.id}" style="--cat-color:${cat.color}">
          <div class="cat-header">
            <div class="cat-icon" style="background:${cat.color}20; color:${cat.color}">
              ${catEmoji(cat.id)}
            </div>
            <div class="cat-meta">
              <h2 class="cat-title">${cat.name}</h2>
              <p class="cat-desc">${cat.description}</p>
            </div>
            <span class="cat-badge" id="badge-${cat.id}">${visible.length} / ${standards.length}</span>
          </div>
          <div class="cards-grid${state.view === 'dense' ? ' dense-grid' : ''}">
            ${standards.map((s) => mkCard(s, cat)).join('')}
          </div>
        </section>`;
    })
    .filter(Boolean)
    .join('');

  main.innerHTML = sections;
  attachCardHandlers();
  updateCounts();
  updateNoResults();
};

const updateVisibility = () => {
  renderContent();
  syncUrl();
};

const updateNoResults = () => {
  const totalVisible = isToolsSection()
    ? LANDSCAPE.tools.filter(isVisible).length
    : isLeaderboardsSection()
      ? getLeaderboards().filter(isLeaderboardVisible).length
      : getStandards().filter(isStandardVisible).length;
  const noResults = $('#no-results');
  const main = $('#main-content');
  if (totalVisible === 0 && hasActiveFilters()) {
    noResults.hidden = false;
    main.style.display = 'none';
  } else {
    noResults.hidden = true;
    main.style.display = '';
  }
};

const updateCounts = () => {
  if (isToolsSection()) {
    const totalVisible = LANDSCAPE.tools.filter(isVisible).length;
    const total = LANDSCAPE.tools.length;
    $('#stat-visible').textContent = totalVisible;
    $('#stat-total').textContent = total;
    $('#tool-count').textContent =
      totalVisible === total ? `${total} tools` : `${totalVisible} of ${total} tools`;
  } else if (isLeaderboardsSection()) {
    const totalVisible = getLeaderboards().filter(isLeaderboardVisible).length;
    const total = getLeaderboards().length;
    $('#stat-visible').textContent = totalVisible;
    $('#stat-total').textContent = total;
    $('#tool-count').textContent =
      totalVisible === total ? `${total} leaderboards` : `${totalVisible} of ${total} leaderboards`;
  } else {
    const totalVisible = getStandards().filter(isStandardVisible).length;
    const total = getStandards().length;
    $('#stat-visible').textContent = totalVisible;
    $('#stat-total').textContent = total;
    $('#tool-count').textContent =
      totalVisible === total ? `${total} standards` : `${totalVisible} of ${total} standards`;
  }
};

const renderCatNav = () => {
  const nav = $('#cat-nav');
  const filtering = hasActiveFilters();
  const visibleInCat = (catId) => {
    if (isToolsSection()) {
      return LANDSCAPE.tools.some((t) => t.category === catId && isVisible(t));
    }
    if (isLeaderboardsSection()) {
      return getLeaderboards().some((lb) => lb.category === catId && isLeaderboardVisible(lb));
    }
    return getStandards().some((s) => s.category === catId && isStandardVisible(s));
  };
  nav.innerHTML = LANDSCAPE.categories
    .filter((cat) => !filtering || visibleInCat(cat.id))
    .map((cat) => `
      <li>
        <a href="#cat-${cat.id}" class="cat-nav-link">
          <span class="cat-nav-dot" style="background:${cat.color}"></span>
          ${cat.name}
        </a>
      </li>`)
    .join('');
};

const renderUseCaseFilters = () => {
  const list = $('#usecase-filters');
  const items = [
    `<li class="filter-item active" data-group="useCase" data-value="all" tabindex="0">
       <span class="filter-dot" aria-hidden="true"></span>All Use Cases
     </li>`,
    ...Object.entries(USE_CASE_LABELS).map(([id, label]) => `
      <li class="filter-item" data-group="useCase" data-value="${id}" tabindex="0">
        <span class="filter-dot use-case-dot" aria-hidden="true"></span>${label}
      </li>`),
  ];
  list.innerHTML = items.join('');
};

const renderStandardTypeFilters = () => {
  const list = $('#standardtype-filters');
  const items = [
    `<li class="filter-item active" data-group="standardType" data-value="all" tabindex="0">
       <span class="filter-dot" aria-hidden="true"></span>All Standard Types
     </li>`,
    ...Object.entries(STANDARD_TYPE_LABELS).map(([id, label]) => `
      <li class="filter-item" data-group="standardType" data-value="${id}" tabindex="0">
        <span class="filter-dot std-type-dot" aria-hidden="true"></span>${label}
      </li>`),
  ];
  list.innerHTML = items.join('');
};

/* ============================================================
   Card handlers
   ============================================================ */
const attachCardHandlers = () => {
  $$('.tool-card').forEach((card) => {
    const handler = () => {
      if (card.dataset.kind === 'standard') openStandardModal(card.dataset.id);
      else if (card.dataset.kind === 'leaderboard') openLeaderboardModal(card.dataset.id);
      else openModal(card.dataset.id);
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
};

/* ============================================================
   Compare
   ============================================================ */
const toggleCompare = (toolId) => {
  const idx = state.compare.indexOf(toolId);
  if (idx >= 0) {
    state.compare.splice(idx, 1);
  } else if (state.compare.length < 3) {
    state.compare.push(toolId);
  }
  renderCompareBar();
  syncUrl();
  if ($('#modal-backdrop').hidden === false) openModal(toolId);
  else renderContent();
};

const renderCompareBar = () => {
  const bar = $('#compare-bar');
  const chips = $('#compare-bar-chips');
  const btn = $('#btn-compare-open');
  bar.hidden = state.compare.length === 0;
  $('#compare-bar-label').textContent =
    `${state.compare.length} tool${state.compare.length === 1 ? '' : 's'} selected`;
  chips.innerHTML = state.compare.map((id) => {
    const t = getTool(id);
    return t ? `<button class="compare-chip" data-id="${id}" type="button">${t.shortName} ×</button>` : '';
  }).join('');
  btn.disabled = state.compare.length < 2;
  document.body.classList.toggle('has-compare-bar', state.compare.length > 0);
};

const openCompareModal = () => {
  if (state.compare.length < 2) return;
  const tools = state.compare.map(getTool).filter(Boolean);
  const rows = [
    ['Name', ...tools.map((t) => t.name)],
    ['Category', ...tools.map((t) => getCategory(t.category)?.name || '')],
    ['Status', ...tools.map((t) => STATUS_LABELS[t.status] || t.status)],
    ['Hardware', ...tools.map((t) => t.hardware.map((h) => HW_LABELS[h]).join(', '))],
    ['Types', ...tools.map((t) => t.types.map((ty) => TYPE_LABELS[ty]).join(', '))],
    ['Use cases', ...tools.map((t) => (t.useCases || []).map((u) => USE_CASE_LABELS[u]).join(', ') || '—')],
    ['Hosting', ...tools.map((t) => HOSTING_LABELS[t.hosting] || '—')],
    ['Adoption', ...tools.map((t) => ADOPTION_LABELS[t.adoption] || '—')],
    ['Model scope', ...tools.map((t) => MODEL_SCOPE_LABELS[t.modelScope] || '—')],
    ['Output formats', ...tools.map((t) => (t.outputFormats || []).join(', ') || '—')],
    ['Datasets', ...tools.map((t) => (t.datasets || []).slice(0, 4).join(', ') || '—')],
    ['Stars', ...tools.map((t) => fmtNum(t.stars || 0))],
    ['License', ...tools.map((t) => t.license || '—')],
    ['Last reviewed', ...tools.map((t) => fmtDate(t.lastReviewed))],
  ];

  $('#compare-inner').innerHTML = `
    <div class="compare-header">
      <h2 id="compare-title">Compare tools</h2>
      <p class="compare-sub">Side-by-side comparison of ${tools.length} selected tools.</p>
    </div>
    <div class="compare-table-wrap">
      <table class="compare-table">
        <tbody>
          ${rows.map(([label, ...vals]) => `
            <tr>
              <th scope="row">${label}</th>
              ${vals.map((v) => `<td>${v}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="compare-links">
      ${tools.map((t) => `
        <button class="header-btn header-btn-ghost" type="button" data-open-tool="${t.id}">
          View ${t.shortName}
        </button>`).join('')}
    </div>`;

  $$('[data-open-tool]', $('#compare-inner')).forEach((btn) => {
    btn.addEventListener('click', () => {
      closeCompareModal();
      openModal(btn.dataset.openTool);
    });
  });

  $('#compare-backdrop').hidden = false;
  document.body.classList.add('no-scroll');
};

const closeCompareModal = () => {
  $('#compare-backdrop').hidden = true;
  document.body.classList.remove('no-scroll');
};

/* ============================================================
   Modal
   ============================================================ */
let lastFocused = null;

const extraLinks = (tool) => {
  const links = [];
  if (tool.docs) links.push({ label: 'Documentation', url: tool.docs });
  if (tool.paper) links.push({ label: 'Paper', url: tool.paper });
  if (tool.huggingface) links.push({ label: 'Hugging Face', url: tool.huggingface });
  if (!links.length) return '';
  return `
    <div class="modal-section">
      <div class="modal-section-title">Resources</div>
      <div class="modal-links">
        ${links.map((l) => `
          <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="modal-link">
            ${l.label} ${extIcon}
          </a>`).join('')}
      </div>
    </div>`;
};

const relatedTools = (tool) => {
  const ids = tool.related || [];
  const related = ids.map(getTool).filter(Boolean);
  if (!related.length) return '';
  return `
    <div class="modal-section">
      <div class="modal-section-title">Related Tools</div>
      <div class="related-list">
        ${related.map((r) => `
          <button class="related-chip" type="button" data-related="${r.id}">
            ${r.shortName || r.name}
          </button>`).join('')}
      </div>
    </div>`;
};

const toolEnrichmentSections = (tool) => {
  const sections = [];
  if (tool.hosting) {
    sections.push(`
      <div class="modal-section">
        <div class="modal-section-title">Deployment</div>
        <div class="modal-badges"><span class="badge meta-hosting">${HOSTING_LABELS[tool.hosting]}</span></div>
      </div>`);
  }
  if (tool.adoption) {
    sections.push(`
      <div class="modal-section">
        <div class="modal-section-title">Adoption</div>
        <div class="modal-badges"><span class="badge meta-adoption">${ADOPTION_LABELS[tool.adoption]}</span></div>
      </div>`);
  }
  if (tool.foundation) {
    sections.push(`
      <div class="modal-section">
        <div class="modal-section-title">Foundation / Backing</div>
        <span class="license-tag">${tool.foundation}</span>
      </div>`);
  }
  if (tool.modelScope) {
    sections.push(`
      <div class="modal-section">
        <div class="modal-section-title">Model Compatibility</div>
        <div class="modal-badges"><span class="badge meta-scope">${MODEL_SCOPE_LABELS[tool.modelScope]}</span></div>
      </div>`);
  }
  if (tool.outputFormats?.length) {
    sections.push(`
      <div class="modal-section">
        <div class="modal-section-title">Output Formats</div>
        <div class="modal-badges">${tool.outputFormats.map((f) => `<span class="badge meta-format">${f}</span>`).join('')}</div>
      </div>`);
  }
  if (tool.datasets?.length) {
    sections.push(`
      <div class="modal-section">
        <div class="modal-section-title">Datasets &amp; Benchmarks</div>
        <div class="modal-badges">${tool.datasets.map((d) => `<span class="badge meta-dataset">${d}</span>`).join('')}</div>
      </div>`);
  }
  return sections.join('');
};

const openModal = (toolId) => {
  const tool = getTool(toolId);
  if (!tool) return;
  const cat = getCategory(tool.category);
  const inCompare = state.compare.includes(toolId);

  $('#modal-inner').innerHTML = `
    <div class="modal-hero" style="background:${tool.logo ? 'var(--surface)' : cat.color}">
      ${tool.logo
        ? `<img src="${tool.logo}" alt="${tool.name} logo" class="modal-logo" onerror="this.style.display='none'">`
        : `<span class="modal-initials">${tool.initials}</span>`}
      ${tool.org ? `<span class="modal-org"${tool.logo ? ` style="color:var(--text-muted)"` : ''}>${tool.org}</span>` : ''}
    </div>
    <div class="modal-body">
      <div class="modal-title-row">
        <div>
          <div class="modal-name" id="modal-title">${tool.name}</div>
          <div class="modal-cat" style="color:${cat.color}">${cat.name}</div>
        </div>
        ${statusBadge(tool.status)}
      </div>
      <p class="modal-desc">${tool.description}</p>

      <div class="modal-section">
        <div class="modal-section-title">Hardware Support</div>
        <div class="modal-badges">${tool.hardware.map(hwBadge).join('')}</div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Benchmark Type</div>
        <div class="modal-badges">${tool.types.map(typeBadge).join('')}</div>
      </div>

      ${(tool.useCases || []).length ? `
        <div class="modal-section">
          <div class="modal-section-title">Use Cases</div>
          <div class="modal-badges">${tool.useCases.map(useCaseBadge).join('')}</div>
        </div>` : ''}

      ${toolEnrichmentSections(tool)}

      ${tool.metrics?.length ? `
        <div class="modal-section">
          <div class="modal-section-title">Key Metrics</div>
          <ul class="metric-list">${tool.metrics.map((m) => `<li>${m}</li>`).join('')}</ul>
        </div>` : ''}

      ${tool.license ? `
        <div class="modal-section">
          <div class="modal-section-title">License</div>
          <span class="license-tag">${tool.license}</span>
        </div>` : ''}

      ${tool.lastReviewed ? `
        <div class="modal-section">
          <div class="modal-section-title">Last Reviewed</div>
          <span class="license-tag">${fmtDate(tool.lastReviewed)}</span>
        </div>` : ''}

      ${(tool.stars || tool.forks) ? `
        <div class="modal-section">
          <div class="modal-section-title">GitHub</div>
          <div class="modal-gh-stats">
            <span class="modal-gh-stat">${starIcon}<strong>${fmtNum(tool.stars)}</strong> stars</span>
            <span class="modal-gh-stat">${forkIcon}<strong>${fmtNum(tool.forks)}</strong> forks</span>
          </div>
        </div>` : ''}

      ${relatedTools(tool)}
      ${extraLinks(tool)}

      <div class="modal-actions">
        ${tool.url && tool.url !== '#' ? `
          <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="modal-cta">
            View Repository
            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden="true">
              <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
            </svg>
          </a>` : ''}
        <button class="header-btn header-btn-ghost modal-compare-btn" type="button" id="modal-compare-btn"
          ${state.compare.length >= 3 && !inCompare ? 'disabled' : ''}>
          ${inCompare ? 'Remove from compare' : 'Add to compare'}
        </button>
      </div>
    </div>`;

  $('#modal-compare-btn')?.addEventListener('click', () => toggleCompare(toolId));
  $$('[data-related]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.related));
  });

  lastFocused = document.activeElement;
  $('#modal-backdrop').hidden = false;
  document.body.classList.add('no-scroll');
  setUrlTool(toolId);
  $('#modal-close').focus();
};

const relatedLeaderboardTools = (lb) => {
  const tools = (lb.relatedTools || []).map(getTool).filter(Boolean);
  if (!tools.length) return '';
  return `
    <div class="modal-section">
      <div class="modal-section-title">Related Benchmark Tools</div>
      <div class="related-list">
        ${tools.map((t) => `
          <button class="related-chip" type="button" data-related-tool="${t.id}">
            ${t.shortName || t.name}
          </button>`).join('')}
      </div>
    </div>`;
};

const openLeaderboardModal = (lbId) => {
  const lb = getLeaderboard(lbId);
  if (!lb) return;
  const cat = getCategory(lb.category);

  $('#modal-inner').innerHTML = `
    <div class="modal-hero" style="background:${lb.logo ? 'var(--surface)' : cat.color}">
      ${lb.logo
        ? `<img src="${lb.logo}" alt="${lb.name} logo" class="modal-logo" onerror="this.style.display='none'">`
        : `<span class="modal-initials">${lb.initials}</span>`}
      ${lb.org ? `<span class="modal-org"${lb.logo ? ` style="color:var(--text-muted)"` : ''}>${lb.org}</span>` : ''}
    </div>
    <div class="modal-body">
      <div class="modal-title-row">
        <div>
          <div class="modal-name" id="modal-title">${lb.name}</div>
          <div class="modal-cat" style="color:${cat.color}">${cat.name}</div>
        </div>
        <div class="modal-badges">${lbBadge()}${statusBadge(lb.status)}</div>
      </div>
      <p class="modal-desc">${lb.description}</p>

      <div class="modal-section">
        <div class="modal-section-title">Benchmark Type</div>
        <div class="modal-badges">${lb.types.map(typeBadge).join('')}</div>
      </div>

      ${lb.metrics?.length ? `
        <div class="modal-section">
          <div class="modal-section-title">Ranked Metrics</div>
          <ul class="metric-list">${lb.metrics.map((m) => `<li>${m}</li>`).join('')}</ul>
        </div>` : ''}

      ${lb.lastReviewed ? `
        <div class="modal-section">
          <div class="modal-section-title">Last Reviewed</div>
          <span class="license-tag">${fmtDate(lb.lastReviewed)}</span>
        </div>` : ''}

      ${relatedLeaderboardTools(lb)}

      <div class="modal-actions">
        <a href="${lb.url}" target="_blank" rel="noopener noreferrer" class="modal-cta">
          Visit Leaderboard ${extIcon}
        </a>
      </div>
    </div>`;

  $$('[data-related-tool]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal();
      setSection('tools');
      openModal(btn.dataset.relatedTool);
    });
  });

  lastFocused = document.activeElement;
  $('#modal-backdrop').hidden = false;
  document.body.classList.add('no-scroll');
  setUrlLeaderboard(lbId);
  $('#modal-close').focus();
};

const closeModal = () => {
  $('#modal-backdrop').hidden = true;
  document.body.classList.remove('no-scroll');
  setUrlTool(null);
  setUrlLeaderboard(null);
  setUrlStandard(null);
  if (lastFocused) lastFocused.focus();
};

const relatedStandardLinks = (std) => {
  const tools = (std.relatedTools || []).map(getTool).filter(Boolean);
  const boards = (std.relatedLeaderboards || []).map(getLeaderboard).filter(Boolean);
  if (!tools.length && !boards.length) return '';
  return `
    ${tools.length ? `
      <div class="modal-section">
        <div class="modal-section-title">Related Tools</div>
        <div class="related-list">
          ${tools.map((t) => `
            <button class="related-chip" type="button" data-related-tool="${t.id}">${t.shortName}</button>`).join('')}
        </div>
      </div>` : ''}
    ${boards.length ? `
      <div class="modal-section">
        <div class="modal-section-title">Related Leaderboards</div>
        <div class="related-list">
          ${boards.map((lb) => `
            <button class="related-chip" type="button" data-related-lb="${lb.id}">${lb.shortName}</button>`).join('')}
        </div>
      </div>` : ''}`;
};

const openStandardModal = (standardId) => {
  const std = getStandard(standardId);
  if (!std) return;
  const cat = getCategory(std.category);

  $('#modal-inner').innerHTML = `
    <div class="modal-hero" style="background:${std.logo ? 'var(--surface)' : cat.color}">
      ${std.logo
        ? `<img src="${std.logo}" alt="${std.name} logo" class="modal-logo" onerror="this.style.display='none'">`
        : `<span class="modal-initials">${std.initials}</span>`}
      ${std.org ? `<span class="modal-org">${std.org}</span>` : ''}
    </div>
    <div class="modal-body">
      <div class="modal-title-row">
        <div>
          <div class="modal-name" id="modal-title">${std.name}</div>
          <div class="modal-cat" style="color:${cat.color}">${cat.name}</div>
        </div>
        <div class="modal-badges">${standardTypeBadge(std.standardType)}${statusBadge(std.status)}</div>
      </div>
      <p class="modal-desc">${std.description}</p>

      ${std.conformance ? `
        <div class="modal-section">
          <div class="modal-section-title">Conformance &amp; Eval Relevance</div>
          <p class="modal-conformance">${std.conformance}</p>
        </div>` : ''}

      <div class="modal-section">
        <div class="modal-section-title">Details</div>
        <div class="modal-badges">
          ${std.types.map(typeBadge).join('')}
          ${std.year ? `<span class="badge std-year">${std.year}</span>` : ''}
        </div>
      </div>

      ${std.lastReviewed ? `
        <div class="modal-section">
          <div class="modal-section-title">Last Reviewed</div>
          <span class="license-tag">${fmtDate(std.lastReviewed)}</span>
        </div>` : ''}

      ${relatedStandardLinks(std)}

      <div class="modal-section">
        <div class="modal-section-title">Official Source</div>
        <div class="modal-links">
          <a href="${std.url}" target="_blank" rel="noopener noreferrer" class="modal-link">
            ${std.urlLabel || `View on ${std.org}`} ${extIcon}
          </a>
        </div>
      </div>

      <div class="modal-actions">
        <a href="${std.url}" target="_blank" rel="noopener noreferrer" class="modal-cta">
          ${std.urlLabel || 'View Standard'} ${extIcon}
        </a>
      </div>
    </div>`;

  $$('[data-related-tool]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal();
      setSection('tools');
      openModal(btn.dataset.relatedTool);
    });
  });
  $$('[data-related-lb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal();
      setSection('leaderboards');
      openLeaderboardModal(btn.dataset.relatedLb);
    });
  });

  lastFocused = document.activeElement;
  $('#modal-backdrop').hidden = false;
  document.body.classList.add('no-scroll');
  setUrlStandard(standardId);
  $('#modal-close').focus();
};

/* ============================================================
   Wizard
   ============================================================ */
const scoreToolForWizard = (tool, goal, context, hw) => {
  let score = 0;
  if (goal) {
    const g = WIZARD_GOALS.find((x) => x.id === goal);
    if (g?.types.some((t) => tool.types.includes(t))) score += 3;
    if (tool.category === goal) score += 2;
  }
  if (context) {
    const c = WIZARD_CONTEXTS.find((x) => x.id === context);
    if (c?.types?.some((t) => tool.types.includes(t))) score += 2;
    if (c?.useCases?.some((u) => (tool.useCases || []).includes(u))) score += 3;
  }
  if (hw && hw !== 'any') {
    if (hw === 'gpu' && tool.hardware.includes('gpu')) score += 2;
    if (hw === 'cpu' && tool.hardware.includes('cpu')) score += 2;
    if (hw === 'both' && tool.hardware.includes('cpu') && tool.hardware.includes('gpu')) score += 2;
  }
  if (tool.status === 'active') score += 1;
  score += Math.min((tool.stars || 0) / 10000, 2);
  return score;
};

const renderWizard = () => {
  const inner = $('#wizard-inner');
  if (wizardStep === 0) {
    inner.innerHTML = `
      <div class="wizard-header">
        <h2 id="wizard-title">Find a benchmarking tool</h2>
        <p class="wizard-sub">Answer a few questions and we'll suggest the best matches.</p>
      </div>
      <div class="wizard-step">
        <div class="wizard-question">What do you want to evaluate?</div>
        <div class="wizard-options">
          ${WIZARD_GOALS.map((g) => `
            <button class="wizard-option" type="button" data-wizard="goal" data-value="${g.id}">
              ${g.label}
            </button>`).join('')}
        </div>
      </div>`;
  } else if (wizardStep === 1) {
    inner.innerHTML = `
      <div class="wizard-header">
        <h2 id="wizard-title">Find a benchmarking tool</h2>
        <p class="wizard-sub">Step 2 of 3 — deployment context</p>
      </div>
      <div class="wizard-step">
        <div class="wizard-question">What's your deployment context?</div>
        <div class="wizard-options">
          ${WIZARD_CONTEXTS.map((c) => `
            <button class="wizard-option" type="button" data-wizard="context" data-value="${c.id}">
              ${c.label}
            </button>`).join('')}
        </div>
        <button class="wizard-back" type="button" data-wizard="back">← Back</button>
      </div>`;
  } else if (wizardStep === 2) {
    inner.innerHTML = `
      <div class="wizard-header">
        <h2 id="wizard-title">Find a benchmarking tool</h2>
        <p class="wizard-sub">Step 3 of 3 — hardware</p>
      </div>
      <div class="wizard-step">
        <div class="wizard-question">What hardware do you have?</div>
        <div class="wizard-options">
          <button class="wizard-option" type="button" data-wizard="hw" data-value="any">Any / not sure</button>
          <button class="wizard-option" type="button" data-wizard="hw" data-value="cpu">CPU only</button>
          <button class="wizard-option" type="button" data-wizard="hw" data-value="gpu">GPU</button>
          <button class="wizard-option" type="button" data-wizard="hw" data-value="both">CPU + GPU</button>
        </div>
        <button class="wizard-back" type="button" data-wizard="back">← Back</button>
      </div>`;
  } else {
    const results = LANDSCAPE.tools
      .filter((t) => t.status !== 'archived')
      .map((t) => ({ tool: t, score: scoreToolForWizard(t, wizardAnswers.goal, wizardAnswers.context, wizardAnswers.hw) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    inner.innerHTML = `
      <div class="wizard-header">
        <h2 id="wizard-title">Recommended tools</h2>
        <p class="wizard-sub">Top matches based on your answers.</p>
      </div>
      <div class="wizard-results">
        ${results.length ? results.map(({ tool }) => {
          const cat = getCategory(tool.category);
          return `
            <div class="wizard-result-card">
              <div class="wizard-result-name">${tool.name}</div>
              <div class="wizard-result-cat" style="color:${cat.color}">${cat.name}</div>
              <p class="wizard-result-desc">${tool.description}</p>
              <button class="header-btn" type="button" data-wizard-open="${tool.id}">View details</button>
            </div>`;
        }).join('') : '<p class="wizard-empty">No strong matches found. Try browsing the full landscape.</p>'}
      </div>
      <button class="wizard-back" type="button" data-wizard="restart">Start over</button>`;

    $$('[data-wizard-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeWizard();
        openModal(btn.dataset.wizardOpen);
      });
    });
  }

  $$('[data-wizard]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.wizard;
      if (field === 'back') { wizardStep = Math.max(0, wizardStep - 1); renderWizard(); return; }
      if (field === 'restart') { wizardStep = 0; wizardAnswers = {}; renderWizard(); return; }
      wizardAnswers[field] = btn.dataset.value;
      wizardStep += 1;
      renderWizard();
    });
  });
};

const openWizard = () => {
  wizardStep = 0;
  wizardAnswers = {};
  renderWizard();
  $('#wizard-backdrop').hidden = false;
  document.body.classList.add('no-scroll');
};

const closeWizard = () => {
  $('#wizard-backdrop').hidden = true;
  document.body.classList.remove('no-scroll');
};

/* ============================================================
   Filters & UI sync
   ============================================================ */
const applyFilterUI = () => {
  ['hw', 'type', 'useCase', 'status', 'standardType'].forEach((group) => {
    $$(`[data-group="${group}"]`).forEach((item) => {
      const active = item.dataset.value === state[group];
      item.classList.toggle('active', active);
      if (item.hasAttribute('aria-checked')) item.setAttribute('aria-checked', active);
    });
  });
  $('#search').value = state.search;
  const placeholders = {
    tools: 'Search tools…',
    leaderboards: 'Search leaderboards…',
    standards: 'Search standards…',
  };
  $('#search').placeholder = placeholders[state.section] || 'Search…';
  $('#sort').value = state.sort;
  const starsOpt = $('#sort option[value="stars"]');
  const yearOpt = $('#sort option[value="year"]');
  if (starsOpt) starsOpt.hidden = !isToolsSection();
  if (yearOpt) yearOpt.hidden = !isStandardsSection();
  if (!isToolsSection() && state.sort === 'stars') state.sort = 'default';
  if (!isStandardsSection() && state.sort === 'year') state.sort = 'default';
  $('#btn-comfy').classList.toggle('active', state.view === 'comfy');
  $('#btn-dense').classList.toggle('active', state.view === 'dense');
  $('#btn-comfy').setAttribute('aria-pressed', state.view === 'comfy');
  $('#btn-dense').setAttribute('aria-pressed', state.view === 'dense');
};

const updateSectionUI = () => {
  $('#btn-section-tools').classList.toggle('active', isToolsSection());
  $('#btn-section-leaderboards').classList.toggle('active', isLeaderboardsSection());
  $('#btn-section-standards').classList.toggle('active', isStandardsSection());
  $('#btn-section-tools').setAttribute('aria-pressed', isToolsSection());
  $('#btn-section-leaderboards').setAttribute('aria-pressed', isLeaderboardsSection());
  $('#btn-section-standards').setAttribute('aria-pressed', isStandardsSection());
  $('#hw-filter-section').hidden = !isToolsSection();
  $('#usecase-filter-section').hidden = isStandardsSection();
  $('#standardtype-filter-section').hidden = !isStandardsSection();
  $('#btn-wizard').hidden = !isToolsSection();
  $('#compare-bar').hidden = !isToolsSection() || state.compare.length === 0;
  document.body.classList.toggle('has-compare-bar', isToolsSection() && state.compare.length > 0);
  applyFilterUI();
};

const setSection = (section) => {
  if (state.section === section) return;
  state.section = section;
  state.compare = [];
  renderCompareBar();
  renderContent();
  syncUrl();
};

const setFilter = (group, value) => {
  state[group] = value;
  applyFilterUI();
  updateVisibility();
};

const clearFilters = () => {
  state.hw = 'all';
  state.type = 'all';
  state.useCase = 'all';
  state.status = 'current';
  state.standardType = 'all';
  state.search = '';
  applyFilterUI();
  renderContent();
  syncUrl();
};

/* ============================================================
   Init
   ============================================================ */
const init = () => {
  renderUseCaseFilters();
  renderStandardTypeFilters();
  const deep = readUrl();
  applyFilterUI();
  renderContent();
  renderCompareBar();

  $$('.filter-item').forEach((item) => {
    const handler = () => setFilter(item.dataset.group, item.dataset.value);
    item.addEventListener('click', handler);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });

  $('#search').addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    updateVisibility();
  });

  $('#sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderContent();
    syncUrl();
  });

  $('#btn-section-tools').addEventListener('click', () => setSection('tools'));
  $('#btn-section-leaderboards').addEventListener('click', () => setSection('leaderboards'));
  $('#btn-section-standards').addEventListener('click', () => setSection('standards'));

  $('#btn-comfy').addEventListener('click', () => {
    if (state.view === 'comfy') return;
    state.view = 'comfy';
    applyFilterUI();
    renderContent();
    syncUrl();
  });

  $('#btn-dense').addEventListener('click', () => {
    if (state.view === 'dense') return;
    state.view = 'dense';
    applyFilterUI();
    renderContent();
    syncUrl();
  });

  $('#btn-wizard').addEventListener('click', openWizard);
  $('#wizard-close').addEventListener('click', closeWizard);
  $('#wizard-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeWizard();
  });

  $('#btn-clear-filters').addEventListener('click', clearFilters);

  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  $('#compare-close').addEventListener('click', closeCompareModal);
  $('#compare-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCompareModal();
  });

  $('#btn-compare-open').addEventListener('click', openCompareModal);
  $('#btn-compare-clear').addEventListener('click', () => {
    state.compare = [];
    renderCompareBar();
    renderContent();
    syncUrl();
  });

  $('#compare-bar-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.compare-chip');
    if (chip) toggleCompare(chip.dataset.id);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#compare-backdrop').hidden) closeCompareModal();
    else if (!$('#wizard-backdrop').hidden) closeWizard();
    else if (!$('#modal-backdrop').hidden) closeModal();
  });

  if (deep.tool && getTool(deep.tool)) {
    setSection('tools');
    openModal(deep.tool);
  } else if (deep.leaderboard && getLeaderboard(deep.leaderboard)) {
    setSection('leaderboards');
    openLeaderboardModal(deep.leaderboard);
  } else if (deep.standard && getStandard(deep.standard)) {
    setSection('standards');
    openStandardModal(deep.standard);
  }
};

document.addEventListener('DOMContentLoaded', init);
