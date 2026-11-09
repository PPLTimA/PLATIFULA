// PBI-04: product category lookup and management.
const { listCategories } = require('../../../../modules/products/categories.service');

function register(router) {
  router.get('/api/categories', { auth: 'none' }, (ctx) => ctx.json(200, listCategories()));
}

module.exports = { register };
