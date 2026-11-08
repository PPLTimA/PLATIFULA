// Pendaftaran, login, logout, dan pemeriksaan sesi.
const { randomUUID } = require('node:crypto');
const config = require('../../../../config');
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { createRateLimiter } = require('../../../../core/rate-limit');
const { isEmail, text } = require('../../../../core/validate');
const {
  createSession, destroySession, hashPassword, publicUser, verifyPassword,
} = require('../../../../modules/auth/auth.service');

const loginLimiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 });

// Hash tiruan agar waktu respons login tidak membocorkan apakah email terdaftar.
const DUMMY_USER = { ...hashPassword('tidak-dipakai') };

function register(router) {
  // PBI-01 (FR-01): public customer/retailer registration and sign-in entry points.
  router.get('/api/auth/config', { auth: 'none' }, (ctx) => {
    ctx.json(200, { demoLogin: config.demoLogin });
  });

  router.post('/api/auth/register', { auth: 'none' }, async (ctx) => {
    const body = await ctx.body();
    const name = text(body.name);
    const email = text(body.email).toLowerCase();
    const password = String(body.password || '');
    const role = body.role || 'customer';
    const storeName = text(body.storeName);
    const storeAddress = text(body.storeAddress);

    if (body.consent !== true) {
      throw new HttpError(400, 'Persetujuan penggunaan data pribadi wajib dicentang.');
    }
    if (!['customer', 'retailer'].includes(role)) throw new HttpError(400, 'Jenis akun tidak valid.');
    if (name.length < 2 || !isEmail(email) || password.length < 8
      || (role === 'retailer' && (!storeName || !storeAddress))) {
      throw new HttpError(400, 'Isi data dengan benar. Password minimal 8 karakter; akun retailer memerlukan nama dan alamat gerai.');
    }

    const users = db.read('users');
    if (users.some((user) => user.email === email)) {
      throw new HttpError(409, 'Email sudah terdaftar. Silakan masuk.');
    }

    const user = {
      id: randomUUID(),
      name,
      email,
      role,
      ...(role === 'retailer'
        ? { store: { name: storeName, address: storeAddress, description: '', phone: '', latitude: null, longitude: null } }
        : {}),
      ...hashPassword(password),
    };
    users.push(user);
    db.write('users', users);
    ctx.json(200, { user: publicUser(user) }, { 'Set-Cookie': createSession(user.id), 'Cache-Control': 'no-store' });
  });

  router.post('/api/auth/login', { auth: 'none' }, async (ctx) => {
    const body = await ctx.body();
    const email = text(body.email).toLowerCase();
    const password = String(body.password || '');
    const limitKey = `${ctx.req.socket.remoteAddress}|${email}`;

    if (loginLimiter.isLimited(limitKey)) {
      throw new HttpError(429, 'Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.');
    }

    const user = db.read('users').find((item) => item.email === email);
    const passwordOk = verifyPassword(password, user || DUMMY_USER);
    if (!user || user.suspended || !passwordOk) {
      loginLimiter.fail(limitKey);
      throw new HttpError(401, 'Email atau password tidak sesuai.');
    }

    loginLimiter.reset(limitKey);
    ctx.json(200, { user: publicUser(user) }, { 'Set-Cookie': createSession(user.id), 'Cache-Control': 'no-store' });
  });

  // Login tanpa password untuk akun tester (email diawali "tester.").
  router.post('/api/auth/demo', { auth: 'none' }, async (ctx) => {
    if (!config.demoLogin) throw new HttpError(403, 'Login cepat dinonaktifkan.');
    const body = await ctx.body();
    const user = db.read('users')
      .find((item) => item.role === body.role && /^tester\./.test(item.email) && !item.suspended);
    if (!user) throw new HttpError(404, 'Akun tester untuk peran ini tidak ditemukan.');
    ctx.json(200, { user: publicUser(user) }, { 'Set-Cookie': createSession(user.id), 'Cache-Control': 'no-store' });
  });

  router.post('/api/auth/logout', { auth: 'none' }, (ctx) => {
    ctx.json(200, { ok: true }, { 'Set-Cookie': destroySession(ctx.req), 'Cache-Control': 'no-store' });
  });

  router.get('/api/auth/me', { auth: 'optional' }, (ctx) => {
    if (!ctx.user) throw new HttpError(401, 'Belum masuk.');
    ctx.json(200, { user: publicUser(ctx.user) });
  });
}

module.exports = { register };
