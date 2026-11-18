// PBI-05: pengajuan verifikasi usaha oleh retailer (data usaha + dokumen izin usaha).
// Wajib disetujui admin sebelum retailer bisa memposting produk.
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, head, panel, toast } = App.ui;
  const maxDocumentBytes = 512 * 1024;
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

  const STATUS_NOTE = {
    none: 'Lengkapi data usaha di bawah ini lalu ajukan verifikasi.',
    pending: 'Pengajuanmu sedang ditinjau admin. Kamu masih bisa memperbarui data sebelum diputuskan.',
    rejected: 'Pengajuan ditolak. Perbaiki data atau dokumen sesuai alasan di atas, lalu ajukan lagi.',
    revoked: 'Verifikasi dicabut. Perbarui data dan dokumen, lalu ajukan lagi.',
  };

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Dokumen tidak dapat dibaca.'));
      reader.readAsDataURL(file);
    });
  }

  function checkFile(file) {
    if (!allowedTypes.includes(file.type)) throw new Error('Pilih dokumen PDF, PNG, JPG, atau WebP.');
    if (file.size > maxDocumentBytes) throw new Error('Ukuran dokumen maksimal 512 KB.');
  }

  const field = (label, name, value, { type = 'text', required = true, full = false, attrs = '' } = {}) => `
    <div class="form-field${full ? ' full' : ''}">
      <label for="v-${name}">${label}${required ? ' <span class="req">*</span>' : ''}</label>
      <input class="field" id="v-${name}" name="${name}" type="${type}" value="${esc(value || '')}" ${required ? 'required' : ''} ${attrs}>
    </div>`;

  const infoItem = (label, value) => `<div class="info-item"><span>${label}</span><strong>${esc(value || '-')}</strong></div>`;

  function approvedView(verification, store) {
    const user = App.state.user;
    const verifiedAt = verification.decidedAt
      ? new Date(verification.decidedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
      : '-';
    const doc = verification.document || verification.proofImage;
    const notes = verification.notes || verification.proof || '';

    return `
      ${head('VERIFIKASI', 'Verifikasi usaha', 'Retailer harus terverifikasi sebelum memposting produk.')}
      <section class="panel">
        <div class="panel-head">
          <h2>Status</h2>
          <span class="verified-pill"><i aria-hidden="true"></i>Terverifikasi</span>
        </div>
        <p class="muted">Usaha kamu sudah terverifikasi, tidak perlu mengajukan lagi.</p>
        <div class="verified-summary">
          <div class="verified-cell">
            <div><span class="verified-label">Nama Usaha</span><strong>${esc(verification.businessName || store.name || user?.name || '-')}</strong></div>
            <div><span class="verified-label">Tanggal Diverifikasi</span><strong>${esc(verifiedAt)}</strong></div>
          </div>
          <div class="verified-cell">
            <span class="verified-label">Status</span>
            ${badge(verification.status)}
          </div>
          <div class="verified-cell verified-action">
            <button class="btn doc-toggle" type="button" data-verification-doc aria-expanded="false" aria-controls="verificationDocument">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Lihat Dokumen</span>
            </button>
          </div>
        </div>
        <div class="verified-document" id="verificationDocument" hidden>
          <div class="info-grid">
            ${infoItem('Nama pemilik', verification.ownerName)}
            ${infoItem('Nomor NIB', verification.nib)}
            ${infoItem('Jenis usaha', verification.businessType)}
            ${infoItem('Nomor telepon', verification.phone)}
            ${infoItem('Alamat usaha', verification.address)}
            ${notes ? infoItem('Keterangan tambahan', notes) : ''}
          </div>
          ${App.verificationDocument.render(doc, 'retailer-document')}
        </div>
      </section>`;
  }

  async function render() {
    const [verification, options] = await Promise.all([
      App.api.get('/api/verification'),
      App.api.get('/api/verification/options'),
    ]);
    App.state.user.verification = verification.status;
    const store = App.state.user.store || {};
    const tone = verification.status === 'approved' ? '' : 'yellow';

    // Sudah disetujui: formulir tidak ditampilkan; dokumen hanya terlihat setelah "Lihat Dokumen" ditekan.
    if (verification.status === 'approved') return approvedView(verification, store);

    const currentDoc = verification.document || verification.proofImage;
    const chosenType = verification.businessType || '';

    return `
      ${head('VERIFIKASI', 'Verifikasi usaha', 'Retailer harus terverifikasi sebelum memposting produk.')}
      ${panel('Status', `
        <p>Status: ${badge(verification.status, tone)} ${esc(verification.reason ? `Alasan: ${verification.reason}` : '')}</p>
        <p class="muted">${STATUS_NOTE[verification.status] || STATUS_NOTE.none}</p>
        <form id="verificationForm">
          <div class="form-grid">
            ${field('Nama usaha', 'businessName', verification.businessName || store.name, { attrs: 'maxlength="100"' })}
            ${field('Nama pemilik', 'ownerName', verification.ownerName, { attrs: 'maxlength="100"' })}
            ${field('Nomor NIB', 'nib', verification.nib, { attrs: 'maxlength="30" placeholder="Contoh: 1234567890123"' })}
            <div class="form-field">
              <label for="v-businessType">Jenis usaha <span class="req">*</span></label>
              <select class="field" id="v-businessType" name="businessType" required>
                <option value="">Pilih jenis usaha</option>
                ${options.businessTypes.map((type) => `<option value="${esc(type)}"${type === chosenType ? ' selected' : ''}>${esc(type)}</option>`).join('')}
              </select>
            </div>
            ${field('Alamat usaha', 'address', verification.address || store.address, { full: true, attrs: 'maxlength="255"' })}
            ${field('Nomor telepon', 'phone', verification.phone || store.phone, { type: 'tel', attrs: 'maxlength="20"' })}
            <div class="form-field full">
              <label for="v-notes">Keterangan tambahan (opsional)</label>
              <textarea class="field" id="v-notes" name="notes" maxlength="500">${esc(verification.notes || verification.proof || '')}</textarea>
            </div>
            <div class="form-field full">
              <label for="verificationFile">Dokumen izin usaha (PDF, PNG, JPG, atau WebP; maksimal 512 KB) <span class="req">*</span></label>
              <input class="field" id="verificationFile" name="document" type="file" accept="application/pdf,image/png,image/jpeg,image/webp">
              <div id="verificationFilePreview">${currentDoc ? `<p class="muted">Dokumen saat ini (dipakai bila kamu tidak memilih file baru):</p>${App.verificationDocument.render(currentDoc, 'retailer-current')}` : ''}</div>
            </div>
          </div>
          <button class="btn primary" type="submit">${verification.status === 'pending' ? 'Perbarui pengajuan' : 'Ajukan verifikasi'}</button>
          <div class="auth-error" role="alert"></div>
        </form>`)}`;
  }

  // Pratinjau file yang baru dipilih.
  App.events.on('change', '#verificationFile', async (input) => {
    const [file] = input.files;
    const preview = document.getElementById('verificationFilePreview');
    if (!file) return;
    try { checkFile(file); } catch (error) { input.value = ''; throw error; }
    const data = await readFile(file);
    preview.innerHTML = App.verificationDocument.render({ name: file.name, type: file.type, data }, 'retailer-new');
  });

  App.events.onSubmit('#verificationForm', async (form, values) => {
    const [file] = form.querySelector('[name="document"]').files;
    let documentPayload;
    if (file) {
      checkFile(file);
      documentPayload = { name: file.name, data: await readFile(file) };
    }
    const { document: _file, ...fields } = values;
    await App.api.post('/api/verification', { ...fields, document: documentPayload });
    toast('Pengajuan terkirim.');
    await App.router.refresh();
  });

  // Tombol "Lihat Dokumen" pada status terverifikasi.
  App.events.on('click', '[data-verification-doc]', (button) => {
    const area = document.getElementById('verificationDocument');
    const show = area.hidden;
    area.hidden = !show;
    button.setAttribute('aria-expanded', String(show));
    button.querySelector('span').textContent = show ? 'Sembunyikan Dokumen' : 'Lihat Dokumen';
  });

  App.router.registerPage({ id: 'verification', label: 'Verifikasi usaha', icon: '✓', roles: ['retailer'], order: 60, render });
})();
