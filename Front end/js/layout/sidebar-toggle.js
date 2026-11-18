// Sidebar sebagai drawer: dibuka dengan tombol garis tiga, ditutup dengan tombol ✕,
// klik area gelap, tombol Esc, atau setelah memilih menu.
(() => {
  const app = document.getElementById('app');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');
  const closeButton = document.getElementById('sidebarClose');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!app || !sidebar || !toggle) return;

  const isOpen = () => app.classList.contains('sidebar-open');

  function setOpen(open, { restoreFocus = false } = {}) {
    app.classList.toggle('sidebar-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    if (open) closeButton?.focus({ preventScroll: true });
    else if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  closeButton?.addEventListener('click', () => setOpen(false, { restoreFocus: true }));
  backdrop?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { restoreFocus: true });
  });
  // Pilih menu (atau tombol pintasan di sidebar) lalu drawer menutup sendiri.
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('[data-page], [data-goto]')) setOpen(false);
  });
  // Saat logout/ganti halaman login, pastikan drawer tertutup.
  new MutationObserver(() => { if (app.classList.contains('auth-mode') && isOpen()) setOpen(false); })
    .observe(app, { attributes: true, attributeFilter: ['class'] });
})();
