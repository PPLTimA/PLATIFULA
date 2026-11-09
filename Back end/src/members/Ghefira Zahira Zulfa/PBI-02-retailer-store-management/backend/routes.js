 1  // PBI-02: retailer store profile, map coordinates, and operating hours.
 2  const db = require('../../../../core/database');
 3  const { HttpError } = require('../../../../core/http');
 4  const { text } = require('../../../../core/validate');
 5
 6  const validCoordinates = (latitude, longitude) => {
 7    if ((latitude == null) !== (longitude == null)) return false;
 8    if (latitude == null) return true;
 9    return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
10      && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
11  };
12
13  function register(router) {
14    router.get('/api/store', { roles: ['retailer'] }, (ctx) => {
15      ctx.json(200, ctx.user.store || {});
16    });
17
18    router.put('/api/store', { roles: ['retailer'] }, async (ctx) => {
19      const body = await ctx.body();
20      const store = {
21        openTime: text(body.openTime),
22        closeTime: text(body.closeTime),
23        name: text(body.name),
24        address: text(body.address),
25        description: text(body.description),
26        phone: text(body.phone),
27        latitude: body.latitude === '' || body.latitude == null ? null : Number(body.latitude),
28        longitude: body.longitude === '' || body.longitude == null ? null : Number(body.longitude),
29      };
30      if (!store.name || !store.address) throw new HttpError(400, 'Nama dan alamat gerai wajib diisi.');
31      if (!validCoordinates(store.latitude, store.longitude)) {
32        throw new HttpError(400, 'Koordinat harus diisi berpasangan dan berada dalam rentang yang valid.');
33      }
34
35      const users = db.read('users');
36      users.find((account) => account.id === ctx.user.id).store = store;
37      db.write('users', users);
38
39      const products = db.read('products');
40      products.filter((product) => product.storeId === ctx.user.id)
41        .forEach((product) => { product.store = store.name; });
42      db.write('products', products);
43      ctx.json(200, store);
44    });
45  }
46
47  module.exports = { register };