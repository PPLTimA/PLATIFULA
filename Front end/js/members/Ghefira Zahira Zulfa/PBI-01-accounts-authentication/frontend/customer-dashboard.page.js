// PBI-01 (FR-01): customer dashboard and impact summary.
(() => {
  const { escapeHtml: esc, formatRupiah, shortId } = App.utils;
  const { emptyState, head, panel, stat } = App.ui;

  function recentOrdersTable(orders) {
    if (!orders.length) {
      return emptyState('▤', 'Belum ada pesanan', 'Pesanan terbaru akan muncul di sini saat transaksi pertama dibuat.');
    }
    return `<div class="table-wrap"><table>
      <thead><tr><th>Pesanan</th><th>Gerai</th><th>Produk</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${orders.slice(0, 5).map((order) => `
        <tr>
          <td>#${esc(shortId(order.id))}</td>
          <td>${esc(order.store)}</td>
          <td>${esc(order.productName)} · ${order.quantity} pack</td>
          <td>${formatRupiah(order.total)}</td>
          <td><span class="badge ${order.status === 'Awaiting pickup' ? 'yellow' : ''}">${esc(order.status)}</span></td>
        </tr>`).join('')}
      </tbody></table></div>`;
  }

  async function render() {
    const [summary, orders] = await Promise.all([App.api.get('/api/dashboard'), App.api.get('/api/orders')]);
    const stats = [
      stat('Total pesanan', summary.orderCount, '▤', summary.completedCount, 'selesai'),
      stat('Pesanan selesai', summary.completedCount, '✓', summary.rescuedPacks, 'pack diselamatkan'),
      stat('Estimasi hemat', formatRupiah(summary.estimatedSaved), 'Rp', summary.rescuedPacks, 'pack selesai'),
      stat('Pesanan berjalan', orders.filter((o) => ['Awaiting pickup', 'Ready for pickup'].includes(o.status)).length, '◷', 'aktif', 'menunggu pickup'),
    ];

    return `
      ${head('RINGKASAN AKUN', `Halo, ${esc(App.state.user.name)}`,
        'Pantau pesanan dan temukan makanan surplus.',
        '<button class="btn primary" data-goto="discover">Cari makanan</button>')}
      <section class="impact-banner">
        <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=960&q=80" alt="Bahan pangan segar untuk dibagikan dan diselamatkan">
        <div class="impact-shade"></div>
        <div class="impact-copy">
          <span class="impact-tag"><b>02</b> ZERO HUNGER</span>
          <h2>Setiap pilihan baik mengurangi makanan terbuang.</h2>
          <p>${summary.rescuedPacks} pack berhasil diselamatkan dari pesananmu</p>
        </div>
        <button class="impact-action" data-goto="discover" aria-label="Cari makanan">Temukan surplus <span>↗</span></button>
      </section>
      <div class="grid stats">${stats.join('')}</div>
      ${panel('Pesanan terakhir', recentOrdersTable(orders), ['Lihat semua', 'orders'])}`;
  }

  App.router.registerPage({ id: 'dashboard', label: 'Dashboard', icon: '▦', roles: ['customer'], order: 10, render });
})();
