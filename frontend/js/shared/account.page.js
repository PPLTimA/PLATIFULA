// Pengaturan akun (semua peran): profil, ganti password, dan hapus akun.
(() => {
  const { escapeHtml: esc } = App.utils;
  const { head, panel, toast } = App.ui;

  async function render() {
    const account = await App.api.get('/api/account');
    return `
      ${head('AKUN', 'Pengaturan akun', 'Perbarui profil, ganti password, atau hapus akunmu.')}
      <div class="grid two-col">
        ${panel('Profil', `
          <form id="accountForm" class="account-form">
            <div class="form-field"><label>Nama</label><input class="field" name="name" required minlength="2" value="${esc(account.name)}"></div>
            <div class="form-field"><label>Email</label><input class="field" value="${esc(account.email)}" disabled></div>
            <div class="form-field"><label>Telepon</label><input class="field" name="phone" value="${esc(account.phone)}"></div>
            <button class="btn primary" type="submit">Simpan profil</button><div class="auth-error" role="alert"></div>
          </form>`)}
        ${panel('Ganti password', `
          <form id="passwordForm" class="account-form">
            <div class="form-field"><label>Password saat ini</label><input class="field" name="currentPassword" type="password" required autocomplete="current-password"></div>
            <div class="form-field"><label>Password baru</label><input class="field" name="newPassword" type="password" required minlength="8" autocomplete="new-password"></div>
            <button class="btn primary" type="submit">Ganti password</button><div class="auth-error" role="alert"></div>
          </form>`)}
      </div>
      ${panel('Hapus akun', `
        <form id="deleteAccountForm" class="account-form">
          <p class="muted">Akun, listing, dan notifikasimu akan dihapus permanen. Pesanan yang masih berjalan dibatalkan.</p>
          <div class="form-field"><label>Password untuk konfirmasi</label><input class="field" name="password" type="password" required autocomplete="current-password"></div>
          <button class="btn danger" type="submit">Hapus akun saya</button><div class="auth-error" role="alert"></div>
        </form>`)}`;
  }

  App.events.onSubmit('#accountForm', async (form, values) => {
    const account = await App.api.put('/api/account', values);
    App.state.user.name = account.name;
    await App.router.refresh();
    toast('Profil akun tersimpan.');
  });

  App.events.onSubmit('#passwordForm', async (form, values) => {
    await App.api.put('/api/account/password', values);
    await App.router.refresh();
    toast('Password berhasil diganti.');
  });

  App.events.onSubmit('#deleteAccountForm', async (form, values) => {
    if (!window.confirm('Akun akan dihapus permanen. Lanjutkan?')) {
      form.querySelector('[type="submit"]').disabled = false;
      return;
    }
    await App.api.delete('/api/account', values);
    App.state.user = null;
    App.auth.show('login');
    toast('Akunmu sudah dihapus.');
  });

  App.router.registerPage({
    id: 'account', label: 'Pengaturan akun', icon: '⚙', roles: ['customer', 'retailer', 'admin'], order: 900, render,
  });
})();
