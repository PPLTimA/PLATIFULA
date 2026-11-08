// Ringkasan dashboard, profil akun, ganti password, dan hapus akun.
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { text } = require('../../../../core/validate');
const { hashPassword, verifyPassword } = require('../../../../modules/auth/auth.service');
const { STATUS } = require('../../../../modules/orders/orders.service');
const { removeUserCascade } = require('../../../../modules/account/account.service');

function dashboardFor(user) {
  const isRetailer = user.role === 'retailer';
  const orders = db.read('orders')
    .filter((order) => (isRetailer ? order.storeId === user.id : order.customerId === user.id));
  const completed = orders.filter((order) => order.status === STATUS.COMPLETED);
  const allProducts = db.read('products');
  const products = isRetailer ? allProducts.filter((product) => product.storeId === user.id) : allProducts;

  const estimatedSaved = completed.reduce((sum, order) => {
    const product = allProducts.find((item) => item.id === order.productId);
    return sum + (product ? Math.max(0, product.originalPrice * order.quantity - order.total) : 0);
  }, 0);

  return {
    role: user.role,
    orderCount: orders.length,
    completedCount: completed.length,
    rescuedPacks: completed.reduce((sum, order) => sum + order.quantity, 0),
    estimatedSaved,
    activeListings: products.filter((product) => product.quantity > 0 && product.status !== 'Expired').length,
    totalStock: products.reduce((sum, product) => sum + product.quantity, 0),
    grossSales: completed.reduce((sum, order) => sum + order.total, 0),
    commissionPaid: completed.reduce((sum, order) => sum + (order.commission || 0), 0),
  };
}

function register(router) {
  // Cross-PBI shared account/profile APIs; see proposal requirements for each consumer.
  router.get('/api/dashboard', (ctx) => ctx.json(200, dashboardFor(ctx.user)));

  router.get('/api/account', (ctx) => {
    const { name, email, role, phone } = ctx.user;
    ctx.json(200, { name, email, role, phone: phone || '' });
  });

  router.put('/api/account', async (ctx) => {
    const body = await ctx.body();
    const name = text(body.name);
    const phone = text(body.phone);
    if (name.length < 2) throw new HttpError(400, 'Nama minimal terdiri dari 2 karakter.');

    const users = db.read('users');
    const account = users.find((item) => item.id === ctx.user.id);
    Object.assign(account, { name, phone });
    db.write('users', users);
    ctx.json(200, { name, email: account.email, role: account.role, phone });
  });

  router.put('/api/account/password', async (ctx) => {
    const body = await ctx.body();
    const newPassword = String(body.newPassword || '');
    if (!verifyPassword(String(body.currentPassword || ''), ctx.user)) {
      throw new HttpError(400, 'Password saat ini tidak sesuai.');
    }
    if (newPassword.length < 8) throw new HttpError(400, 'Password baru minimal 8 karakter.');

    const users = db.read('users');
    Object.assign(users.find((item) => item.id === ctx.user.id), hashPassword(newPassword));
    db.write('users', users);
    ctx.json(200, { ok: true });
  });

  router.delete('/api/account', async (ctx) => {
    const body = await ctx.body();
    if (!verifyPassword(String(body.password || ''), ctx.user)) {
      throw new HttpError(403, 'Password tidak sesuai.');
    }
    if (ctx.user.role === 'admin'
      && db.read('users').filter((account) => account.role === 'admin').length <= 1) {
      throw new HttpError(409, 'Admin terakhir tidak dapat menghapus akunnya sendiri.');
    }
    removeUserCascade(ctx.user.id);
    ctx.json(200, { deleted: true });
  });
}

module.exports = { register };
