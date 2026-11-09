// PBI-20: no-show records and repeat-customer restrictions.
(() => {
  function action(order) {
    if (!['Awaiting pickup', 'Ready for pickup'].includes(order.status)) return '';
    return `<button class="btn sm danger" data-order-no-show="${App.utils.escapeHtml(order.id)}">Tandai no-show</button>`;
  }

  App.events.on('click', '[data-order-no-show]', async (button) => {
    if (!window.confirm('Tandai pesanan ini sebagai no-show? Stok akan dikembalikan.')) return;
    await App.api.post(`/api/retailer/orders/${encodeURIComponent(button.dataset.orderNoShow)}/no-show`);
    await App.router.refresh();
    App.ui.toast('Pesanan ditandai no-show.');
  });

  App.noShow = { action };
})();
