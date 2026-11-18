// Admin: daftar pengajuan verifikasi usaha retailer. Keputusan diambil di halaman tinjau (admin-review.page.js).
(() => {
  const { escapeHtml: esc } = App.utils;
  const { badge, emptyState, head, panel } = App.ui;

  const TONE = { approved: '', pending: 'yellow', rejected: 'red', revoked: 'red' };
  const LABEL = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', revoked: 'Dicabut' };
  const FILTERS = [['all', 'Semua'], ['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak'], ['revoked', 'Dicabut']];
  const formatDate = (value) => (value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '-');

  let filter = 'pending';

  async function render() {
    const items = await App.api.get('/api/admin/verifications');
    const count = (status) => (status === 'all' ? items.length : items.filter((item) => item.status === status).length);
    // Yang menunggu keputusan tampil paling atas, lalu yang terbaru.
    const shown = items
      .filter((item) => filter === 'all' || item.status === filter)
      .sort((a, b) => (Number(b.status === 'pending') - Number(a.status === 'pending'))
        || String(b.submittedAt || b.decidedAt || '').localeCompare(String(a.submittedAt || a.decidedAt || '')));

    const rows = shown.map((item) => `
      <tr>
        <td><b>${esc(item.name)}</b>${item.ownerName ? `<small class="muted" style="display:block">${esc(item.ownerName)}</small>` : ''}</td>
        <td>${esc(formatDate(item.submittedAt))}</td>
        <td>${badge(LABEL[item.status] || item.status, TONE[item.status] ?? 'gray')}</td>
        <td><button class="btn sm primary" type="button" data-review="${esc(item.id)}">Tinjau</button></td>
      </tr>`).join('');

    const tabs = FILTERS.map(([key, label]) => `
      <button type="button" class="${filter === key ? 'active' : ''}" data-verification-filter="${key}">${label} (${count(key)})</button>`).join('');

    const body = shown.length
      ? `<div class="table-wrap"><table>
          <thead><tr><th>Usaha</th><th>Tanggal pengajuan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table></div>`
      : emptyState('✓', 'Tidak ada pengajuan', filter === 'pending' ? 'Belum ada pengajuan yang menunggu keputusan.' : 'Tidak ada pengajuan dengan status ini.', '', true);

    return `
      ${head('ADMIN / TRUST', 'Verifikasi retailer', 'Pilih pengajuan untuk meninjau data dan dokumennya sebelum memutuskan.')}
      ${panel('Daftar pengajuan', `<div class="pill-tabs">${tabs}</div>${body}`)}`;
  }

  App.events.on('click', '[data-verification-filter]', async (button) => {
    filter = button.dataset.verificationFilter;
    await App.router.refresh();
  });

  App.events.on('click', '[data-review]', (button) => {
    App.verificationReview.select(button.dataset.review);
    App.router.navigate('verification-review');
  });

  App.router.registerPage({ id: 'verifications', label: 'Verifikasi retailer', icon: '✓', roles: ['admin'], order: 30, render });
})();
