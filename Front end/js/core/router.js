
(() => {
  const pages = [];
  let navigationToken = 0;

  const landingPage = (role) => (role === 'admin' ? 'admin' : role === 'retailer' ? 'retailer' : 'dashboard');
  const findPage = (id, role) => pages.find((page) => page.id === id && page.roles.includes(role));

  function registerPage(definition) {
    pages.push({ nav: true, order: 500 + pages.length, ...definition });
  }

  const pagesFor = (role) => pages
    .filter((page) => page.nav && page.roles.includes(role))
    .sort((a, b) => a.order - b.order);

  async function navigate(id) {
    const { user } = App.state;
    if (!user) {
      App.auth.show(id === 'register' ? 'register' : 'login');
      return;
    }

    const page = findPage(id, user.role) || findPage(landingPage(user.role), user.role);
    const token = ++navigationToken;

    App.state.page = page.id;
    document.getElementById('app').classList.remove('auth-mode');
    document.getElementById('app').dataset.page = page.id;
    App.shell.update();
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.page === page.id);
    });
    document.getElementById('crumb').textContent = page.label;
    App.ui.setContent('<section class="panel loading-state">Memuat data akun...</section>');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await page.render();
      if (token !== navigationToken) return; // pengguna sudah pindah halaman
      const { html, mount } = typeof result === 'string' ? { html: result } : result;
      App.ui.setContent(html);
      if (mount) mount();
    } catch (error) {
      if (token !== navigationToken) return;
      App.ui.setContent(App.ui.panel('Gagal memuat halaman', `<p>${App.utils.escapeHtml(error.message)}</p>`));
      App.ui.toast(error.message);
    }
  }

  const refresh = () => navigate(App.state.page);

  // Tombol [data-goto="idHalaman"] di mana pun di aplikasi.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-goto]');
    if (button) navigate(button.dataset.goto);
  });

  App.router = { landingPage, navigate, pagesFor, refresh, registerPage };
})();
