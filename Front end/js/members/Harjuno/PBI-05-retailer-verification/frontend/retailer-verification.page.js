// Retailer: pengajuan verifikasi usaha (wajib disetujui admin sebelum memposting produk).
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, head, panel, toast } = App.ui;
  const maxImageBytes = 512 * 1024;
  const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];

  function readImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gambar bukti tidak dapat dibaca.'));
      reader.readAsDataURL(file);
    });
  }

  async function render() {
    const verification = await App.api.get('/api/verification');
    App.state.user.verification = verification.status;
    const tone = verification.status === 'approved' ? '' : 'yellow';
    const proofPreview = verification.proofImage
      ? `<img src="${esc(verification.proofImage.data)}" alt="Foto bukti verifikasi" style="display:block;max-width:100%;max-height:320px;margin-top:12px;border-radius:12px">`
      : '';

    return `
      ${head('VERIFIKASI', 'Verifikasi usaha', 'Retailer harus terverifikasi sebelum memposting produk.')}
      ${panel('Status', `
        <p>Status: ${badge(verification.status, tone)} ${esc(verification.reason || '')}</p>
        <form id="verificationForm">
          <div class="form-field">
            <label for="verificationProof">Bukti usaha (nomor NIB atau keterangan)</label>
            <textarea class="field" id="verificationProof" name="proof">${esc(verification.proof || '')}</textarea>
          </div>
          <div class="form-field">
            <label for="verificationImage">Foto dokumen izin usaha (PNG, JPG, WebP; maksimal 512 KB)</label>
            <input class="field" id="verificationImage" name="proofImage" type="file" accept="image/png,image/jpeg,image/webp">
            <div id="verificationImagePreview">${proofPreview}</div>
          </div>
          <button class="btn primary" type="submit">Ajukan verifikasi</button>
          <div class="auth-error" role="alert"></div>
        </form>`)}`;
  }

  App.events.on('change', '#verificationImage', async (input) => {
    const [file] = input.files;
    const preview = document.getElementById('verificationImagePreview');
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) throw new Error('Pilih gambar PNG, JPG, atau WebP.');
    if (file.size > maxImageBytes) throw new Error('Ukuran gambar bukti maksimal 512 KB.');
    const image = await readImage(file);
    preview.innerHTML = `<img src="${esc(image)}" alt="Pratinjau foto bukti" style="display:block;max-width:100%;max-height:320px;margin-top:12px;border-radius:12px">`;
  });

  App.events.onSubmit('#verificationForm', async (form, values) => {
    const [file] = form.querySelector('[name="proofImage"]').files;
    let proofImage;
    if (file) {
      if (!allowedImageTypes.includes(file.type)) throw new Error('Pilih gambar PNG, JPG, atau WebP.');
      if (file.size > maxImageBytes) throw new Error('Ukuran gambar bukti maksimal 512 KB.');
      proofImage = { name: file.name, data: await readImage(file) };
    }

    await App.api.post('/api/verification', { proof: values.proof, proofImage });
    toast('Pengajuan terkirim.');
    await App.router.refresh();
  });

  App.router.registerPage({ id: 'verification', label: 'Verifikasi usaha', icon: '✓', roles: ['retailer'], order: 60, render });
})();
// PBI-05 (FR-05): retailer verification submission.
