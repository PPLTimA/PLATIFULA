// PBI-20: no-show records and repeat-customer restrictions.
const config = require('../../../../config');
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { notify } = require('../../../../modules/notifications/notifications.service');
const { STATUS, isOpen, restoreStock } = require('../../../../modules/orders/orders.service');

function markNoShow(ctx) {
  const orders = db.read('orders');
  const order = orders.find((item) => item.id === ctx.params.id);
  if (!order || order.storeId !== ctx.user.id || !isOpen(order)) {
    throw new HttpError(409, 'Pesanan tidak dapat ditandai no-show.');
  }

  order.status = STATUS.NO_SHOW;
  db.write('orders', orders);
  restoreStock(order);

  const users = db.read('users');
  const customer = users.find((account) => account.id === order.customerId);
  if (customer) {
    customer.noShowCount = (customer.noShowCount || 0) + 1;
    const blocked = customer.noShowCount >= config.noShowLimit;
    if (blocked) customer.suspended = true;
    db.write('users', users);
    notify(customer.id, blocked
      ? `Akunmu dibatasi karena ${config.noShowLimit} kali tidak mengambil pesanan.`
      : `Pesanan tidak diambil (${customer.noShowCount}/${config.noShowLimit}).`);
  }
  ctx.json(200, order);
}

function register(router) {
  router.post('/api/retailer/orders/:id/no-show', { roles: ['retailer'] }, markNoShow);
}

module.exports = { register, markNoShow };
