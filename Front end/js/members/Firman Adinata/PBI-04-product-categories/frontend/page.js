// Admin: kategori produk yang dipakai retailer dan filter customer.
(() => {
  const { escapeHtml: esc } = App.utils;
  const { emptyState, head, panel } = App.ui;

  async function render() {
    const categories = await App.api.get('/api/categories');
    const rows = categories.map((category) => `
      <div class="activity">
        <div>${esc(category.name)}
          <div class="btn-row">
            <button class="btn sm" data-rename-category="${esc(category.id)}" data-name="${esc(category.name)}">Ubah</button>
            <button class="btn sm danger" data-delete-category="${esc(category.id)}">Hapus</button>
          </div>
        </div>
      </div>`).join('');

    return `
      ${head('ADMIN', 'Kategori produk', 'Kelola kategori yang dipakai retailer.')}
      ${panel('Kategori', `
        <form id="categoryForm" class="btn-row">
          <input class="field" name="name" placeholder="Kategori baru" required>
          <button class="btn primary" type="submit">Tambah</button>
        </form>
        ${rows || emptyState('✦', 'Belum ada kategori', 'Tambahkan kategori pertama.', '', true)}`)}`;
  }

  App.events.onSubmit('#categoryForm', async (form, values) => {
    await App.api.post('/api/categories', values);
    await App.router.refresh();
  });

  App.events.on('click', '[data-rename-category]', async (button) => {
    const name = window.prompt('Nama kategori baru:', button.dataset.name);
    if (!name) return;
    await App.api.patch(`/api/categories/${encodeURIComponent(button.dataset.renameCategory)}`, { name });
    await App.router.refresh();
  });

  App.events.on('click', '[data-delete-category]', async (button) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    await App.api.delete(`/api/categories/${encodeURIComponent(button.dataset.deleteCategory)}`);
    await App.router.refresh();
  });

  App.router.registerPage({ id: 'categories', label: 'Kategori', icon: '▧', roles: ['admin'], order: 60, render });
})();
// PBI-04: admin product-category management.
