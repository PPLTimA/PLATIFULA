// Admin: menyetujui, menolak, atau mencabut verifikasi usaha retailer.
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, emptyState, head, panel, toast } = App.ui;

  const TONE = { approved: '', pending: 'yellow', rejected: 'red', revoked: 'red' };

  async function render() {
    const items = await App.api.get('/api/admin/verifications');
    const rows = items.map((item) => `
      <div class="activity">
        <div>
          <b>${esc(item.name)}</b> ${badge(item.status, TONE[item.status] ?? 'gray')}
          ${item.proof ? `<p>${esc(item.proof)}</p>` : ''}
          ${item.proofImage ? `<img src="${esc(item.proofImage.data)}" alt="Foto bukti verifikasi retailer" style="display:block;max-width:100%;max-height:320px;margin:12px 0;border-radius:12px">` : ''}
          ${item.reason ? `<p class="muted">Alasan: ${esc(item.reason)}</p>` : ''}
          <input class="field" id="reason-${esc(item.id)}" placeholder="Alasan (wajib untuk tolak/cabut)">
          <div class="btn-row">
            <button class="btn sm primary" data-verify="approve" data-id="${esc(item.id)}">Setujui</button>
            <button class="btn sm" data-verify="reject" data-id="${esc(item.id)}">Tolak</button>
            <button class="btn sm danger" data-verify="revoke" data-id="${esc(item.id)}">Cabut</button>
          </div>
        </div>
      </div>`).join('');

    return `
      ${head('ADMIN / TRUST', 'Verifikasi retailer', 'Setujui, tolak, atau cabut verifikasi usaha.')}
      ${panel('Pengajuan', rows || emptyState('✓', 'Belum ada pengajuan', 'Pengajuan retailer akan tampil di sini.', '', true))}`;
  }

  App.events.on('click', '[data-verify]', async (button) => {
    const { id, verify: action } = { id: button.dataset.id, verify: button.dataset.verify };
    const reason = document.getElementById(`reason-${CSS.escape(id)}`)?.value || '';
    await App.api.patch(`/api/admin/verifications/${encodeURIComponent(id)}`, { action, reason });
    await App.router.refresh();
    toast('Status verifikasi diperbarui.');
  });

  App.router.registerPage({ id: 'verifications', label: 'Verifikasi retailer', icon: '✓', roles: ['admin'], order: 30, render });
})();
// PBI-05: admin retailer verification decisions.
