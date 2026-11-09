// Admin: daftar akun (filter peran, suspend, hapus) dan penambahan admin baru.
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, head, panel, toast } = App.ui;

  let roleFilter = '';
  let statusFilter = '';

  async function render() {
    const all = await App.api.get('/api/admin/users');
    const users = all.filter((account) => (
      (!roleFilter || account.role === roleFilter)
      && (!statusFilter || String(account.suspended) === statusFilter)
    ));

    const rows = users.map((account) => `
      <tr>
        <td><b>${esc(account.name)}</b><small class="muted">${esc(account.email)}</small></td>
        <td>${esc(account.role)}</td>
        <td>${esc(account.storeName || '-')}</td>
        <td>${badge(account.suspended ? 'Suspended' : 'Active', account.suspended ? 'red' : '')}${account.noShowCount ? `<small class="muted">no-show ${account.noShowCount}x</small>` : ''}</td>
        <td>
          ${account.id === App.state.user.id ? '-' : `
            ${account.role === 'admin' ? '' : `<button class="btn sm ${account.suspended ? '' : 'danger'}" data-toggle-suspension="${esc(account.id)}" data-suspended="${account.suspended}">${account.suspended ? 'Aktifkan' : 'Suspend'}</button>`}
            <button class="btn sm danger" data-delete-user="${esc(account.id)}">Hapus</button>`}
        </td>
      </tr>`).join('');

    return `
      ${head('ADMIN / ACCOUNTS', 'Pengguna', 'Tinjau akun, suspend, hapus, atau tambah admin.')}
      ${panel('Semua akun', `
        <div class="filters">
          <select class="field" id="userRoleFilter">
            <option value="">Semua peran</option>
            ${['customer', 'retailer', 'admin'].map((role) => `<option ${roleFilter === role ? 'selected' : ''}>${role}</option>`).join('')}
          </select>
          <select class="field" id="userStatusFilter">
            <option value="">Semua status</option>
            <option value="false" ${statusFilter === 'false' ? 'selected' : ''}>Aktif</option>
            <option value="true" ${statusFilter === 'true' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Akun</th><th>Role</th><th>Gerai</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`)}
      ${panel('Tambah admin', `
        <form id="adminForm">
          <div class="form-grid">
            <div class="form-field"><label>Nama</label><input class="field" name="name"></div>
            <div class="form-field"><label>Email</label><input class="field" name="email" type="email" required></div>
            <div class="form-field"><label>Password (min 8)</label><input class="field" name="password" type="password" required minlength="8" autocomplete="new-password"></div>
          </div>
          <button class="btn primary" type="submit">Tambah admin</button>
          <div class="auth-error" role="alert"></div>
        </form>`)}`;
  }

  App.events.on('change', '#userRoleFilter', (select) => {
    roleFilter = select.value;
    return App.router.refresh();
  });

  App.events.on('change', '#userStatusFilter', (select) => {
    statusFilter = select.value;
    return App.router.refresh();
  });

  App.events.on('click', '[data-toggle-suspension]', async (button) => {
    await App.api.patch(`/api/admin/users/${encodeURIComponent(button.dataset.toggleSuspension)}`, {
      suspended: button.dataset.suspended !== 'true',
    });
    await App.router.refresh();
    toast('Status akun diperbarui.');
  });

  App.events.on('click', '[data-delete-user]', async (button) => {
    if (!window.confirm('Hapus akun ini beserta datanya?')) return;
    await App.api.delete(`/api/admin/users/${encodeURIComponent(button.dataset.deleteUser)}`);
    await App.router.refresh();
    toast('Akun dihapus.');
  });

  App.events.onSubmit('#adminForm', async (form, values) => {
    await App.api.post('/api/admin/admins', values);
    await App.router.refresh();
    toast('Admin ditambahkan.');
  });

  App.router.registerPage({ id: 'users', label: 'Pengguna', icon: '♙', roles: ['admin'], order: 20, render });
})();
// PBI-03: admin user management.
