import { api } from '../core/api.js';
import { ui } from '../core/ui.js';

export async function renderTemplatesPage() {
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="templates-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Template Produk Saya</h2>
        <button id="btn-create-template" class="btn btn-primary">+ Simpan Template Baru</button>
      </div>

      <div class="row" id="templates-grid">
        <div class="col-12 text-center">Memuat template...</div>
      </div>
    </div>
  `;

  await loadTemplates();
  document.getElementById('btn-create-template').addEventListener('click', openCreateTemplateModal);
}

async function loadTemplates() {
  try {
    const response = await api.get('/templates');
    const grid = document.getElementById('templates-grid');

    if (!response.data || response.data.length === 0) {
      grid.innerHTML = `<div class="col-12 text-center text-muted">Belum ada template produk yang tersimpan.</div>`;
      return;
    }

    grid.innerHTML = response.data.map(t => `
      <div class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${t.name}</h5>
            <p class="card-text text-muted small">${t.description || 'Tidak ada deskripsi'}</p>
            <p class="mb-1"><strong>Harga Asli:</strong> Rp${Number(t.original_price).toLocaleString('id-ID')}</p>
            <p class="mb-3"><strong>Harga Diskon:</strong> Rp${Number(t.discounted_price).toLocaleString('id-ID')}</p>
            <button class="btn btn-sm btn-success btn-use-template" data-template='${JSON.stringify(t)}'>Gunakan Template</button>
            <button class="btn btn-sm btn-danger btn-delete-template" data-id="${t.id}">Hapus</button>
          </div>
        </div>
      </div>
    `).join();

    attachTemplateListeners();
  } catch (error) {
    ui.showNotification('Gagal memuat template: ' + error.message, 'danger');
  }
}

function attachTemplateListeners() {
  document.querySelectorAll('.btn-delete-template').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('Yakin ingin menghapus template ini?')) {
        await api.delete(`/templates/${id}`);
        ui.showNotification('Template berhasil dihapus', 'success');
        loadTemplates();
      }
    });
  });

  document.querySelectorAll('.btn-use-template').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const templateData = JSON.parse(e.target.getAttribute('data-template'));
      // Mengarahkan ke form posting produk dengan mengisi otomatis data dari template
      window.location.hash = `#/retailer/products/add?name=${encodeURIComponent(templateData.name)}&price=${templateData.original_price}&discount=${templateData.discounted_price}`;
    });
  });
}

function openCreateTemplateModal() {
  ui.showModal('Simpan Template Produk Baru', `
    <form id="form-template">
      <div class="form-group mb-2">
        <label>Nama Template</label>
        <input type="text" name="name" class="form-control" required placeholder="Contoh: Roti Tawar Sisa Kemarin" />
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
        <label>Deskripsi</label>
        <textarea name="description" class="form-control"></textarea>
      </div>
      <button type="submit" class="btn btn-primary mt-3">Simpan Template</button>
    </form>
  `);

  document.getElementById('form-template').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    await api.post('/templates', payload);
    ui.closeModal();
    ui.showNotification('Template produk berhasil disimpan!', 'success');
    loadTemplates();
  });
}