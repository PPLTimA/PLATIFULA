// Potongan HTML yang dipakai berulang oleh semua halaman.
// Semua argumen berupa HTML; panggil escapeHtml untuk data dari pengguna/server.
(() => {
  const { escapeHtml: esc } = App.utils;

  const content = () => document.getElementById('content');

  function head(kicker, title, description, action = '') {
    return `
      <div class="page-head">
        <div>
          <div class="eyebrow">${kicker}</div>
          <h1>${title}</h1>
          <p>${description}</p>
        </div>
        ${action ? `<div class="btn-row">${action}</div>` : ''}
      </div>`;
  }

  function stat(label, value, icon, delta, footnote) {
    return `
      <div class="stat">
        <div class="stat-top">${label}<span class="stat-icon">${icon}</span></div>
        <div class="stat-value">${value}</div>
        <span class="positive">↗ ${delta}</span>
        <span class="stat-foot">${footnote}</span>
      </div>`;
  }

  /** link = [teks, idHalaman] untuk tombol di kanan judul panel. */
  function panel(title, body, link = null) {
    const linkButton = link ? `<button class="link" data-goto="${link[1]}">${link[0]} ↗</button>` : '';
    return `
      <section class="panel">
        <div class="panel-head"><h2>${title}</h2>${linkButton}</div>
        ${body}
      </section>`;
  }

  function emptyState(icon, title, description, action = '', compact = false) {
    return `
      <div class="empty-state${compact ? ' compact' : ''}">
        <span class="empty-state-icon" aria-hidden="true">${icon}</span>
        <h3>${title}</h3>
        <p>${description}</p>
        ${action ? `<div class="empty-state-action">${action}</div>` : ''}
      </div>`;
  }

  /** tone: '' (hijau) | 'yellow' | 'red' | 'gray' */
  const badge = (text, tone = '') => `<span class="badge ${tone}">${esc(text)}</span>`;

  function field(label, name, { type = 'text', value = '', attrs = '', full = false } = {}) {
    return `
      <div class="form-field${full ? ' full' : ''}">
        <label>${label}</label>
        <input class="field" name="${name}" type="${type}" value="${esc(value)}" ${attrs}>
      </div>`;
  }

  function selectField(label, name, options, selected = '') {
    return `
      <div class="form-field">
        <label>${label}</label>
        <select class="field" name="${name}">
          ${options.map((option) => `<option ${option === selected ? 'selected' : ''}>${esc(option)}</option>`).join('')}
        </select>
      </div>`;
  }

  function toast(message) {
    const element = document.getElementById('toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => element.classList.remove('show'), 2500);
  }

  const setContent = (html) => { content().innerHTML = html; };

  App.ui = { badge, content, emptyState, field, head, panel, selectField, setContent, stat, toast };
})();
