import { api } from '../core/api.js';
import { ui } from '../core/ui.js';

export async function renderProductsPage() {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="products-management-container">
      <div class="page-header d-flex justify-content-between align-items-center mb-4">
        <h2>Kelola Produk Surplus</h2>
        <button id="btn-add-product" class="btn btn-primary">+ Tambah Produk Surplus</button>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Harga Asli</th>
              <th>Harga Diskon</th>
              <th>Stok</th>
              <th>Tgl Kedaluwarsa</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="products-list-body">
            <tr><td colspan="7" class="text-center">Memuat data produk...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  await loadProducts();
  document.getElementById('btn-add-product').addEventListener('click', openAddProductModal);
}

async function loadProducts() {
  try {
    const response = await api.get('/products/retailer');
    const tbody = document.getElementById('products-list-body');
    
    if (!response.data || response.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada produk surplus yang ditambahkan.</td></tr>`;
      return;
    }

    tbody.innerHTML = response.data.map(product => `
      <tr>
        <td><strong>${product.name}</strong></td>
        <td><del>Rp${Number(product.original_price).toLocaleString('id-ID')}</del></td>
        <td><span class="text-success font-weight-bold">Rp${Number(product.discounted_price).toLocaleString('id-ID')}</span></td>
        <td>${product.stock}</td>
        <td>${new Date(product.expiry_date).toLocaleDateString('id-ID')}</td>
        <td>
          <span class="badge ${product.status === 'active' ? 'badge-success' : 'badge-secondary'}">
            ${product.status}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-info btn-edit" data-id="${product.id}">Ubah</button>
          <button class="btn btn-sm ${product.status === 'active' ? 'btn-warning' : 'btn-success'} btn-toggle" data-id="${product.id}" data-status="${product.status}">
            ${product.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${product.id}">Hapus</button>
        </td>
      </tr>
    `).join('');

    attachActionListeners();
  } catch (error) {
    ui.showNotification('Gagal memuat produk: ' + error.message, 'danger');
  }
}

function attachActionListeners() {
  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const currentStatus = e.target.getAttribute('data-status');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await api.patch(`/products/${id}/status`, { status: newStatus });
      ui.showNotification(`Status produk berhasil diubah ke ${newStatus}`, 'success');
      loadProducts();
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        await api.delete(`/products/${id}`);
        ui.showNotification('Produk berhasil dihapus', 'success');
        loadProducts();
      }
    });
  });
}

function openAddProductModal() {
  // Buka dialog modal penambahan produk
  ui.showModal('Tambah Produk Surplus', `
    <form id="form-product">
      <div class="form-group mb-2">
        <label>Nama Produk</label>
        <input type="text" name="name" class="form-control" required />
      </div>
      <div class="form-group mb-2">
        <label>Harga Asli</label>
        <input type="number" name="original_price" class="form-control" required />
      </div>
      <div class="form-group mb-2">
        <label>Harga Diskon</label>
        <input type="number" name="discounted_price" class="form-control" required />
      </div>
      <div class="form-group mb-2">
        <label>Stok</label>
        <input type="number" name="stock" class="form-control" required />
      </div>
      <div class="form-group mb-2">
        <label>Tanggal Kedaluwarsa</label>
        <input type="date" name="expiry_date" class="form-control" required />
      </div>
      <button type="submit" class="btn btn-primary mt-3">Simpan Produk</button>
    </form>
  `);

  document.getElementById('form-product').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    await api.post('/products', payload);
    ui.closeModal();
    ui.showNotification('Produk surplus berhasil ditambahkan!', 'success');
    loadProducts();
  });
}