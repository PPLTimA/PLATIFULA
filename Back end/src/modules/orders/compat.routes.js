// Backward-compatible aliases for the role-specific PBI order routes.
const { HttpError } = require('../../core/http');
const { listRetailerOrders } = require('../../members/Kenneth Nathaniel Tirtadjaja/PBI-12-retailer-orders-pickup/backend/list.routes');
const { createOrder } = require('../../members/Kenneth Nathaniel Tirtadjaja/PBI-11-customer-orders/backend/create.routes');
const { listCustomerOrders, cancelCustomerOrder } = require('../../members/Kenneth Nathaniel Tirtadjaja/PBI-11-customer-orders/backend/history.routes');
const { updateRetailerOrder } = require('../../members/Kenneth Nathaniel Tirtadjaja/PBI-12-retailer-orders-pickup/backend/pickup.routes');
const { markNoShow } = require('../../members/Firman Adinata/PBI-20-no-show/backend/routes');

function register(router) {
  router.get('/api/orders', (ctx) => {
    if (ctx.user.role === 'retailer') return listRetailerOrders(ctx);
    if (ctx.user.role === 'customer') return listCustomerOrders(ctx);
    throw new HttpError(403, 'Fitur ini tidak tersedia untuk peran akunmu.');
  });
  router.post('/api/orders', { roles: ['customer'] }, createOrder);
  router.patch('/api/orders/:id', async (ctx) => {
    if (ctx.user.role === 'retailer') return updateRetailerOrder(ctx);
    if (ctx.user.role === 'customer') return cancelCustomerOrder(ctx);
    throw new HttpError(403, 'Fitur ini tidak tersedia untuk peran akunmu.');
  });
  router.post('/api/orders/:id/no-show', { roles: ['retailer'] }, markNoShow);
}

module.exports = { register };
