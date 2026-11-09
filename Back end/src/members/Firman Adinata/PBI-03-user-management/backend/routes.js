// Admin: daftar akun, suspend, hapus akun, dan menambah admin baru.
const { randomUUID } = require('node:crypto');
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { isEmail, text } = require('../../../../core/validate');
const { removeUserCascade } = require('../../../../modules/account/account.service');
const { hashPassword } = require('../../../../modules/auth/auth.service');

const adminOnly = { roles: ['admin'] };

function register(router) {
  // PBI-03: admin user management.
  router.get('/api/admin/users', adminOnly, (ctx) => {
    ctx.json(200, db.read('users').map(({ id, name, email, role, suspended, store, verification, noShowCount }) => ({
      id, name, email, role,
      suspended: Boolean(suspended),
      storeName: store?.name || '',
      verification: verification?.status || '',
      noShowCount: noShowCount || 0,
    })));
  });

  router.patch('/api/admin/users/:id', adminOnly, async (ctx) => {
    const users = db.read('users');
    const account = users.find((item) => item.id === ctx.params.id);
    if (!account || account.role === 'admin' || account.id === ctx.user.id) {
      throw new HttpError(404, 'Akun tidak ditemukan atau tidak dapat diubah.');
    }
    const { suspended } = await ctx.body();
    if (typeof suspended !== 'boolean') throw new HttpError(400, 'Status suspend harus berupa boolean.');

    account.suspended = suspended;
    if (!suspended) account.noShowCount = 0;
    db.write('users', users);
    ctx.json(200, { id: account.id, suspended: account.suspended });
  });

  router.delete('/api/admin/users/:id', adminOnly, (ctx) => {
    if (ctx.params.id === ctx.user.id) throw new HttpError(400, 'Tidak bisa menghapus akun sendiri.');
    if (!db.read('users').some((account) => account.id === ctx.params.id)) {
      throw new HttpError(404, 'Akun tidak ditemukan.');
    }
    removeUserCascade(ctx.params.id);
    ctx.json(200, { deleted: true });
  });

  router.post('/api/admin/admins', adminOnly, async (ctx) => {
    const body = await ctx.body();
    const email = text(body.email).toLowerCase();
    const password = String(body.password || '');
    const users = db.read('users');
    if (!isEmail(email) || password.length < 8 || users.some((account) => account.email === email)) {
      throw new HttpError(400, 'Email/password tidak valid atau sudah terdaftar.');
    }

    const admin = { id: randomUUID(), name: text(body.name) || 'Admin', email, role: 'admin', ...hashPassword(password) };
    users.push(admin);
    db.write('users', users);
    const { salt, passwordHash, ...safe } = admin;
    ctx.json(201, safe);
  });
}

module.exports = { register };
