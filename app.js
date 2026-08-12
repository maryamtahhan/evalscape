'use strict';

/* ============================================================
   State
   ============================================================ */
const state = {
  hw:     'all',   // 'all' | 'cpu' | 'gpu' | 'both'
  type:   'all',   // 'all' | 'online' | 'offline' | 'embedding' | 'audio' | 'security'
  search: '',
  view:   'comfy', // 'comfy' | 'dense'
};

/* ============================================================
   Helpers
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const getCategory = (id) => LANDSCAPE.categories.find((c) => c.id === id);

/** Does the tool pass the current filter state? */
const isVisible = (tool) => {
  // Hardware
  if (state.hw !== 'all') {
    const hasCpu = tool.hardware.includes('cpu');
    const hasGpu = tool.hardware.includes('gpu');
    if (state.hw === 'cpu'  && !hasCpu) return false;
    if (state.hw === 'gpu'  && !hasGpu) return false;
    if (state.hw === 'both' && !(hasCpu && hasGpu)) return false;
  }
  // Type
  if (state.type !== 'all' && !tool.types.includes(state.type)) return false;
  // Search
  if (state.search) {
    const q = state.search.toLowerCase();
    const haystack = [tool.name, tool.description, tool.org, ...(tool.tags || [])]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

/* ============================================================
   Badge renderers
   ============================================================ */
const HW_LABELS  = { cpu: 'CPU', gpu: 'GPU' };
const TYPE_LABELS = {
  online:    'Online',
  offline:   'Offline',
  embedding: 'Embedding',
  audio:     'Audio',
  security:  'Security',
};
const TYPE_CLASS = {
  online:    't-online',
  offline:   't-offline',
  embedding: 't-emb',
  audio:     't-audio',
  security:  't-sec',
};

const hwBadge   = (hw)   => `<span class="badge hw-${hw}">${HW_LABELS[hw]}</span>`;
const typeBadge = (type) =>
  `<span class="badge ${TYPE_CLASS[type] || ''}">${TYPE_LABELS[type] || type}</span>`;

/* ============================================================
   Card templates
   ============================================================ */
const heroContent = (tool, initialsClass = 'card-initials') =>
  tool.logo
    ? `<img src="${tool.logo}" alt="${tool.name} logo" class="card-logo">`
    : `<span class="${initialsClass}">${tool.initials}</span>`;

const cardComfy = (tool, cat) => `
  <div class="tool-card${isVisible(tool) ? '' : ' dimmed'}"
       data-id="${tool.id}"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${tool.name}">
    <div class="card-hero">
      ${heroContent(tool)}
    </div>
    <div class="card-body">
      <div class="card-name">${tool.name}</div>
      <div class="card-desc">${tool.description}</div>
      <div class="card-badges">
        ${tool.hardware.map(hwBadge).join('')}
        ${tool.types.map(typeBadge).join('')}
      </div>
    </div>
  </div>`;

const cardDense = (tool, cat) => `
  <div class="tool-card dense${isVisible(tool) ? '' : ' dimmed'}"
       data-id="${tool.id}"
       style="--cat-color:${cat.color}"
       role="button"
       tabindex="0"
       aria-label="View details for ${tool.name}">
    <div class="card-hero-dense">
      ${heroContent(tool, 'card-initials-dense')}
    </div>
    <div class="card-name-dense">${tool.shortName}</div>
    <div class="card-badges-dense">
      ${tool.hardware.map(hwBadge).join('')}
    </div>
  </div>`;

/* ============================================================
   Render main content
   ============================================================ */
const renderCards = () => {
  const main = $('#main-content');
  const mkCard = state.view === 'dense' ? cardDense : cardComfy;

  main.innerHTML = LANDSCAPE.categories
    .map((cat) => {
      const tools = LANDSCAPE.tools.filter((t) => t.category === cat.id);
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
            <span class="cat-badge" id="badge-${cat.id}"></span>
          </div>
          <div class="cards-grid${state.view === 'dense' ? ' dense-grid' : ''}">
            ${tools.map((t) => mkCard(t, cat)).join('')}
          </div>
        </section>`;
    })
    .join('');

  attachCardHandlers();
  updateCounts();
};

const catEmoji = (id) => {
  const map = { inference: '⚡', embedding: '🔢', audio: '🎙️', security: '🔒' };
  return map[id] || '📊';
};

/* ============================================================
   Attach card click / keyboard handlers
   ============================================================ */
const attachCardHandlers = () => {
  $$('.tool-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.id);
      }
    });
  });
};

/* ============================================================
   Update visibility without full re-render (fast path)
   ============================================================ */
const updateVisibility = () => {
  $$('.tool-card').forEach((card) => {
    const tool = LANDSCAPE.tools.find((t) => t.id === card.dataset.id);
    if (tool) card.classList.toggle('dimmed', !isVisible(tool));
  });
  updateCounts();
};

/* ============================================================
   Update counts in sidebar + header
   ============================================================ */
const updateCounts = () => {
  let totalVisible = 0;

  LANDSCAPE.categories.forEach((cat) => {
    const tools   = LANDSCAPE.tools.filter((t) => t.category === cat.id);
    const visible = tools.filter(isVisible).length;
    const el = $(`#badge-${cat.id}`);
    if (el) el.textContent = `${visible} / ${tools.length}`;
    totalVisible += visible;
  });

  const total = LANDSCAPE.tools.length;
  $('#stat-visible').textContent = totalVisible;
  $('#stat-total').textContent   = total;
  $('#tool-count').textContent   =
    totalVisible === total
      ? `${total} tools`
      : `${totalVisible} of ${total} tools`;
};

/* ============================================================
   Category navigation (sidebar)
   ============================================================ */
const renderCatNav = () => {
  const nav = $('#cat-nav');
  nav.innerHTML = LANDSCAPE.categories
    .map(
      (cat) => `
      <li>
        <a href="#cat-${cat.id}" class="cat-nav-link">
          <span class="cat-nav-dot" style="background:${cat.color}"></span>
          ${cat.name}
        </a>
      </li>`
    )
    .join('');
};

/* ============================================================
   Modal
   ============================================================ */
let lastFocused = null;

const openModal = (toolId) => {
  const tool = LANDSCAPE.tools.find((t) => t.id === toolId);
  if (!tool) return;
  const cat = getCategory(tool.category);

  $('#modal-inner').innerHTML = `
    <div class="modal-hero" style="background:${tool.logo ? 'var(--surface)' : cat.color}">
      ${tool.logo
        ? `<img src="${tool.logo}" alt="${tool.name} logo" class="modal-logo">`
        : `<span class="modal-initials">${tool.initials}</span>`}
      ${tool.org ? `<span class="modal-org"${tool.logo ? ` style="color:var(--text-muted)"` : ''}>${tool.org}</span>` : ''}
    </div>
    <div class="modal-body">
      <div>
        <div class="modal-name" id="modal-title">${tool.name}</div>
        <div class="modal-cat" style="color:${cat.color}">${cat.name}</div>
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

      ${
        tool.metrics && tool.metrics.length
          ? `<div class="modal-section">
               <div class="modal-section-title">Key Metrics</div>
               <ul class="metric-list">
                 ${tool.metrics.map((m) => `<li>${m}</li>`).join('')}
               </ul>
             </div>`
          : ''
      }

      ${
        tool.license
          ? `<div class="modal-section">
               <div class="modal-section-title">License</div>
               <span class="license-tag">${tool.license}</span>
             </div>`
          : ''
      }

      ${
        tool.url && tool.url !== '#'
          ? `<a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="modal-cta">
               View Repository
               <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                 <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
               </svg>
             </a>`
          : ''
      }
    </div>`;

  lastFocused = document.activeElement;
  const backdrop = $('#modal-backdrop');
  backdrop.hidden = false;
  document.body.classList.add('no-scroll');
  $('#modal-close').focus();
};

const closeModal = () => {
  $('#modal-backdrop').hidden = true;
  document.body.classList.remove('no-scroll');
  if (lastFocused) lastFocused.focus();
};

/* ============================================================
   Filter handler
   ============================================================ */
const setFilter = (group, value) => {
  if (group === 'hw')   state.hw   = value;
  if (group === 'type') state.type = value;

  $$(`[data-group="${group}"]`).forEach((item) =>
    item.classList.toggle('active', item.dataset.value === value)
  );
  updateVisibility();
};

/* ============================================================
   Init
   ============================================================ */
const init = () => {
  renderCards();
  renderCatNav();

  // Sidebar filters
  $$('.filter-item').forEach((item) => {
    item.addEventListener('click', () => setFilter(item.dataset.group, item.dataset.value));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setFilter(item.dataset.group, item.dataset.value);
      }
    });
  });

  // Search
  $('#search').addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    updateVisibility();
  });

  // View toggle
  $('#btn-comfy').addEventListener('click', () => {
    if (state.view === 'comfy') return;
    state.view = 'comfy';
    $('#btn-comfy').classList.add('active');
    $('#btn-dense').classList.remove('active');
    renderCards();
    renderCatNav();
  });
  $('#btn-dense').addEventListener('click', () => {
    if (state.view === 'dense') return;
    state.view = 'dense';
    $('#btn-dense').classList.add('active');
    $('#btn-comfy').classList.remove('active');
    renderCards();
    renderCatNav();
  });

  // Modal close
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
};

document.addEventListener('DOMContentLoaded', init);
