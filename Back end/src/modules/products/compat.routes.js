// Backward-compatible product catalog endpoint.
const { HttpError } = require('../../core/http');
const { listCatalog } = require('../../members/Zaskia Khansa Salviadi/PBI-09-catalog-map-favorites/backend/catalog.routes');
const { listRetailerProducts } = require('../../members/Malika Khansa Tsabita/PBI-07-surplus-products/backend/routes');

function register(router) {
  router.get('/api/products', { auth: 'optional' }, (ctx) => {
    if (ctx.user?.role === 'retailer') return listRetailerProducts(ctx);
    if (ctx.user?.role === 'customer' || !ctx.user) return listCatalog(ctx);
    throw new HttpError(403, 'Fitur ini tidak tersedia untuk peran akunmu.');
  });
}

module.exports = { register };
