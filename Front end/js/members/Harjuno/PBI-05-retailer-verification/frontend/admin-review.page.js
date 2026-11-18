// Admin: halaman tinjau satu pengajuan verifikasi (data usaha, dokumen, lalu keputusan).
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, emptyState, head, panel, toast } = App.ui;

  const TONE = { approved: '', pending: 'yellow', rejected: 'red', revoked: 'red' };
  const LABEL = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', revoked: 'Dicabut' };

  // Aksi yang boleh tampil menurut status saat ini (selaras dengan aturan di backend).
  const ACTIONS_BY_STATUS = {
    pending: ['approve', 'reject'],
    approved: ['revoke'],
    rejected: ['approve'],
    revoked: ['approve'],
  };
  const BUTTONS = {
    approve: (id) => `<button class="btn primary" type="button" data-verify="approve" data-id="${id}">Setujui</button>`,
    reject: (id) => `<button class="btn" type="button" data-verify="reject" data-id="${id}">Tolak</button>`,
    revoke: (id) => `<button class="btn danger" type="button" data-verify="revoke" data-id="${id}">Cabut verifikasi</button>`,
  };
  const formatDate = (value) => (value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '-');
  const item = (label, value, { full = false } = {}) => `<div class="info-item${full ? ' full' : ''}"><span>${label}</span><strong>${esc(value || '-')}</strong></div>`;

  let selectedId = null;

  async function render() {
    const back = '<button class="btn sm" type="button" data-goto="verifications">← Kembali ke daftar</button>';
    if (!selectedId) {
      return `${head('ADMIN / TRUST', 'Tinjau pengajuan', '')}${panel('Pengajuan', `${emptyState('✓', 'Belum ada pengajuan dipilih', 'Pilih pengajuan dari daftar verifikasi.', '', true)}${back}`)}`;
    }

    const data = await App.api.get(`/api/admin/verifications/${encodeURIComponent(selectedId)}`);
    const actions = ACTIONS_BY_STATUS[data.status] || [];
    const needsReason = actions.some((action) => action !== 'approve');
    const id = esc(data.id);

    return {
      html: `
        ${head('ADMIN / TRUST', 'Tinjau pengajuan', 'Periksa data dan dokumen retailer, lalu setujui atau tolak.')}
        <p>${back}</p>
        ${panel('Informasi usaha', `
          <p>${badge(LABEL[data.status] || data.status, TONE[data.status] ?? 'gray')}</p>
          <div class="info-grid">
            ${item('Nama usaha', data.businessName || data.name)}
            ${item('Nama pemilik', data.ownerName)}
            ${item('Nomor NIB', data.nib)}
            ${item('Jenis usaha', data.businessType)}
            ${item('Alamat usaha', data.address || data.store.address, { full: true })}
            ${item('Nomor telepon', data.phone || data.store.phone)}
            ${item('Email akun', data.email)}
            ${item('Tanggal pengajuan', formatDate(data.submittedAt))}
            ${data.decidedAt ? item('Keputusan terakhir', formatDate(data.decidedAt)) : ''}
            ${item('Keterangan tambahan', data.notes, { full: true })}
            ${data.reason ? item('Alasan keputusan sebelumnya', data.reason, { full: true }) : ''}
          </div>`)}
        ${panel('Dokumen izin usaha', App.verificationDocument.render(data.document, 'admin-review'))}
        ${panel('Keputusan', actions.length ? `
          ${needsReason ? `<div class="form-field"><label for="reviewReason">Alasan (wajib untuk menolak atau mencabut)</label>
            <input class="field" id="reviewReason" placeholder="Tulis alasan keputusan"></div>` : ''}
          <div class="btn-row">${actions.map((action) => BUTTONS[action](id)).join('')}</div>`
          : '<p class="muted">Tidak ada keputusan yang dapat diambil.</p>')}`,
      mount() {
        document.querySelector('.nav-item[data-page="verifications"]')?.classList.add('active');
      },
    };
  }

  App.events.on('click', '[data-verify]', async (button) => {
    const reason = document.getElementById('reviewReason')?.value || '';
    await App.api.patch(`/api/admin/verifications/${encodeURIComponent(button.dataset.id)}`, { action: button.dataset.verify, reason });
    toast('Status verifikasi diperbarui.');
    await App.router.navigate('verifications');
  });

  App.verificationReview = { select(id) { selectedId = id; } };

  // Halaman turunan dari daftar verifikasi: tidak muncul di sidebar.
  App.router.registerPage({ id: 'verification-review', label: 'Tinjau pengajuan', icon: '✓', roles: ['admin'], nav: false, render });
})();
