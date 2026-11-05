// Retailer: pengajuan verifikasi usaha (wajib disetujui admin sebelum memposting produk).
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, head, panel, toast } = App.ui;

  async function render() {
    const verification = await App.api.get('/api/verification');
    App.state.user.verification = verification.status;
    const tone = verification.status === 'approved' ? '' : 'yellow';

    return `
      ${head('VERIFIKASI', 'Verifikasi usaha', 'Retailer harus terverifikasi sebelum memposting produk.')}
      ${panel('Status', `
        <p>Status: ${badge(verification.status, tone)} ${esc(verification.reason || '')}</p>
        <form id="verificationForm">
          <div class="form-field">
            <label>Bukti usaha (NIB / tautan foto izin)</label>
            <textarea class="field" name="proof" required>${esc(verification.proof || '')}</textarea>
          </div>
          <button class="btn primary" type="submit">Ajukan verifikasi</button>
          <div class="auth-error" role="alert"></div>
        </form>`)}`;
  }

  App.events.onSubmit('#verificationForm', async (form, values) => {
    await App.api.post('/api/verification', values);
    toast('Pengajuan terkirim.');
    await App.router.refresh();
  });

  App.router.registerPage({ id: 'verification', label: 'Verifikasi usaha', icon: '✓', roles: ['retailer'], order: 60, render });
})();
