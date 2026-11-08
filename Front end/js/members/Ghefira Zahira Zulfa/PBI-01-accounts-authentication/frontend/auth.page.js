// Halaman masuk/daftar, login cepat tester, logout, dan pemulihan sesi.
(() => {
  const { escapeHtml: esc } = App.utils;

  function screen(mode) {
    const registering = mode === 'register';
    const registrationFields = registering ? `
      <div class="form-field">
        <label for="authName">Nama lengkap</label>
        <input class="field" id="authName" name="name" autocomplete="name" minlength="2" required>
      </div>
      <div class="form-field">
        <label for="authRole">Jenis akun</label>
        <select class="field" id="authRole" name="role">
          <option value="customer">Customer</option>
          <option value="retailer">Retailer / pemilik gerai</option>
        </select>
      </div>
      <div id="retailerFields" class="auth-retailer-fields" hidden>
        <div class="form-field">
          <label for="storeName">Nama gerai</label>
          <input class="field" id="storeName" name="storeName" autocomplete="organization">
        </div>
        <div class="form-field">
          <label for="storeAddress">Alamat gerai</label>
          <input class="field" id="storeAddress" name="storeAddress" autocomplete="street-address">
        </div>
      </div>` : '';

    const consent = registering ? `
      <label class="auth-consent">
        <input type="checkbox" name="consent" required>
        Saya menyetujui penggunaan data pribadi saya sesuai kebijakan platform.
      </label>` : '';

    const demoButtons = !registering && App.state.demoLogin ? `
      <div class="auth-demo">
        <p>Masuk cepat dengan akun tester:</p>
        <div class="btn-row">
          <button class="btn" type="button" data-demo="customer">Customer</button>
          <button class="btn" type="button" data-demo="retailer">Retailer</button>
          <button class="btn primary" type="button" data-demo="admin">Admin</button>
        </div>
      </div>` : '';

    return `
      <div class="auth-screen">
        <section class="auth-visual" aria-label="Zero Hunger food rescue">
          <div class="auth-visual-top">
            <div class="brand">
              <span class="brand-icon">◈</span>
              <div><b>PLATIFUL</b><small>FOOD RESCUE PLATFORM</small></div>
            </div>
            <span class="sdg-mark"><b>02</b><span>ZERO<br>HUNGER</span></span>
          </div>
          <div class="auth-visual-copy">
            <span class="auth-kicker">GOOD FOOD. SECOND CHANCE.</span>
            <h1>Makanan layak.<br>Tak terbuang.</h1>
            <p>Selamatkan surplus pangan, dukung gerai lokal, dan bantu kurangi makanan terbuang.</p>
          </div>
          <div class="auth-visual-bottom">
            <span>PLATIFUL · FOOD RESCUE PLATFORM</span>
            <span>SDG 2 · ZERO HUNGER</span>
          </div>
        </section>
        <section class="auth-panel">
          <div class="auth-panel-inner">
            <div class="auth-panel-heading">
              <span class="auth-kicker">${registering ? 'MULAI BERGABUNG' : 'AKSES AKUN'}</span>
              <h2>${registering ? 'Buat akun.' : 'Welcome back.'}</h2>
              <p>${registering ? 'Pilih peran dan mulai selamatkan makanan.' : 'Masuk untuk melanjutkan perjalanan baikmu.'}</p>
            </div>
            <form class="auth-form" id="authForm" data-mode="${mode}">
              ${registrationFields}
              <div class="form-field">
                <label for="authEmail">Email address</label>
                <input class="field" id="authEmail" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
              </div>
              <div class="form-field">
                <label for="authPassword">Password</label>
                <input class="field" id="authPassword" name="password" type="password" autocomplete="${registering ? 'new-password' : 'current-password'}" minlength="8" required placeholder="Minimal 8 karakter">
              </div>
              ${consent}
              <div class="auth-error" id="authError" role="alert"></div>
              <button class="btn primary" type="submit">${registering ? 'Buat akun' : 'Masuk ke PLATIFUL'} <span aria-hidden="true">→</span></button>
            </form>
            ${demoButtons}
            <p class="auth-switch-line">
              ${registering ? 'Sudah punya akun?' : 'Belum punya akun?'}
              <button class="auth-switch" type="button" data-auth-mode="${registering ? 'login' : 'register'}">${registering ? 'Masuk' : 'Buat akun'}</button>
            </p>
            <p class="auth-footer">Dengan melanjutkan, kamu ikut mendukung pangan yang lebih bertanggung jawab.</p>
          </div>
        </section>
      </div>`;
  }

  function show(mode = 'login') {
    App.state.page = mode;
    const app = document.getElementById('app');
    app.classList.add('auth-mode');
    app.dataset.page = mode;
    document.getElementById('crumb').textContent = mode === 'register' ? 'Buat akun' : 'Sign in';
    App.ui.setContent(screen(mode));
  }

  function signIn(user) {
    App.state.user = user;
    App.router.navigate(App.router.landingPage(user.role));
    App.ui.toast(`Selamat datang, ${user.name}.`);
  }

  App.events.on('click', '[data-auth-mode]', (button) => show(button.dataset.authMode));

  App.events.on('change', '#authRole', (select) => {
    const fields = document.getElementById('retailerFields');
    fields.hidden = select.value !== 'retailer';
    fields.querySelectorAll('input').forEach((input) => { input.required = !fields.hidden; });
  });

  App.events.onSubmit('#authForm', async (form, values) => {
    const registering = form.dataset.mode === 'register';
    const payload = registering ? { ...values, consent: values.consent === 'on' } : values;
    const { user } = await App.api.post(`/api/auth/${registering ? 'register' : 'login'}`, payload);
    signIn(user);
  });

  App.events.on('click', '[data-demo]', async (button) => {
    const { user } = await App.api.post('/api/auth/demo', { role: button.dataset.demo });
    signIn(user);
  });

  document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
      await App.api.post('/api/auth/logout');
    } finally {
      App.state.user = null;
      show('login');
    }
  });

  /** Dipanggil sekali saat halaman dibuka: pulihkan sesi bila masih ada. */
  async function restoreSession() {
    try {
      const config = await App.api.get('/api/auth/config');
      App.state.demoLogin = config.demoLogin;
    } catch { /* backend belum jalan: pesan error muncul saat login */ }

    try {
      const { user } = await App.api.get('/api/auth/me');
      App.state.user = user;
      App.router.navigate(App.router.landingPage(user.role));
    } catch {
      show('login');
    }
  }

  App.auth = { restoreSession, show };
})();
