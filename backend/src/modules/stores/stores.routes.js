// Direktori gerai, profil gerai milik retailer, dan gerai favorit customer.
const db = require('../../core/database');
const { HttpError } = require('../../core/http');
const { isExpired } = require('../products/products.service');
const { localNow } = require('../../core/time');
const { text } = require('../../core/validate');

const validCoordinates = (latitude, longitude) => {
  if ((latitude == null) !== (longitude == null)) return false;
  if (latitude == null) return true;
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
};

function register(router) {
  router.get('/api/stores', (ctx) => {
    const now = localNow();
    const available = {};
    db.read('products').forEach((product) => {
      if (product.storeId && product.quantity > 0 && !isExpired(product, now)) {
        available[product.storeId] = (available[product.storeId] || 0) + 1;
      }
    });

    ctx.json(200, db.read('users')
      .filter((account) => account.role === 'retailer' && account.store)
      .map((account) => ({
        id: account.id,
        name: account.store.name,
        address: account.store.address,
        latitude: account.store.latitude,
        longitude: account.store.longitude,
        description: account.store.description,
        openTime: account.store.openTime || '',
        closeTime: account.store.closeTime || '',
        productCount: available[account.id] || 0,
      })));
  });

  router.get('/api/store', { roles: ['retailer'] }, (ctx) => {
    ctx.json(200, ctx.user.store || {});
  });

  router.put('/api/store', { roles: ['retailer'] }, async (ctx) => {
    const body = await ctx.body();
    const store = {
      openTime: text(body.openTime),
      closeTime: text(body.closeTime),
      name: text(body.name),
      address: text(body.address),
      description: text(body.description),
      phone: text(body.phone),
      latitude: body.latitude === '' || body.latitude == null ? null : Number(body.latitude),
      longitude: body.longitude === '' || body.longitude == null ? null : Number(body.longitude),
    };
    if (!store.name || !store.address) throw new HttpError(400, 'Nama dan alamat gerai wajib diisi.');
    if (!validCoordinates(store.latitude, store.longitude)) {
      throw new HttpError(400, 'Koordinat harus diisi berpasangan dan berada dalam rentang yang valid.');
    }

    const users = db.read('users');
    users.find((account) => account.id === ctx.user.id).store = store;
    db.write('users', users);

    const products = db.read('products');
    products.filter((product) => product.storeId === ctx.user.id)
      .forEach((product) => { product.store = store.name; });
    db.write('products', products);
    ctx.json(200, store);
  });

  router.get('/api/favorites', (ctx) => {
    const ids = ctx.user.favorites || [];
    ctx.json(200, db.read('users')
      .filter((account) => ids.includes(account.id) && account.role === 'retailer')
      .map((account) => ({
        id: account.id,
        name: account.store?.name || account.name,
        address: account.store?.address || '',
        latitude: account.store?.latitude ?? null,
        longitude: account.store?.longitude ?? null,
      })));
  });

  const changeFavorite = (add) => (ctx) => {
    const users = db.read('users');
    const retailer = users.find((account) => account.id === ctx.params.retailerId && account.role === 'retailer');
    if (!retailer || retailer.id === ctx.user.id) throw new HttpError(404, 'Gerai tidak ditemukan.');

    const me = users.find((account) => account.id === ctx.user.id);
    const favorites = new Set(me.favorites || []);
    if (add) favorites.add(retailer.id);
    else favorites.delete(retailer.id);
    me.favorites = [...favorites];
    db.write('users', users);
    ctx.json(200, { favorites: me.favorites });
  };
  router.put('/api/favorites/:retailerId', changeFavorite(true));
  router.delete('/api/favorites/:retailerId', changeFavorite(false));
}

module.exports = { register };
