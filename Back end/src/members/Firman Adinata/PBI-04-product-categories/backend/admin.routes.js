// PBI-04: admin category management.
const { randomUUID } = require('node:crypto');
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { text } = require('../../../../core/validate');
const { listCategories } = require('../../../../modules/products/categories.service');

function register(router) {
  router.post('/api/categories', { roles: ['admin'] }, async (ctx) => {
    const name = text((await ctx.body()).name);
    if (!name) throw new HttpError(400, 'Nama kategori wajib diisi.');
    const categories = listCategories();
    categories.push({ id: randomUUID(), name });
    db.write('categories', categories);
    ctx.json(200, categories);
  });

  router.patch('/api/categories/:id', { roles: ['admin'] }, async (ctx) => {
    const name = text((await ctx.body()).name);
    if (!name) throw new HttpError(400, 'Nama kategori wajib diisi.');
    const categories = listCategories().map((item) => (item.id === ctx.params.id ? { ...item, name } : item));
    db.write('categories', categories);
    ctx.json(200, categories);
  });

  router.delete('/api/categories/:id', { roles: ['admin'] }, (ctx) => {
    const categories = listCategories().filter((item) => item.id !== ctx.params.id);
    db.write('categories', categories);
    ctx.json(200, categories);
  });
}

module.exports = { register };
