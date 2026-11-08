// Tes integrasi alur utama. Jalankan: npm test (tidak butuh MySQL).
process.env.APP_TIMEZONE = 'Asia/Jakarta';
process.env.DEMO_LOGIN = 'on';
delete process.env.NODE_ENV;

const assert = require('node:assert/strict');
const http = require('node:http');
const Module = require('node:module');
const { after, before, describe, it } = require('node:test');

// Ganti mysql2 dengan versi di memori sebelum aplikasi dimuat.
const mockMysql = require('./helpers/mock-mysql');
const originalLoad = Module._load;
Module._load = function load(request, ...rest) {
  return request === 'mysql2/promise' ? mockMysql : originalLoad.call(this, request, ...rest);
};

const db = require('../src/core/database');
const { createRequestHandler } = require('../src/app');
const { hashPassword } = require('../src/modules/auth/auth.service');
const { localNow, toMinutes } = require('../src/core/time');

let server;
let baseUrl;

async function api(method, route, { body, cookie, status = 200 } = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = raw; }
  assert.equal(response.status, status, `${method} ${route} -> ${response.status}: ${raw}`);
  const setCookie = response.headers.get('set-cookie')?.match(/platiful_session=[^;]*/)?.[0];
  return { data, cookie: setCookie || cookie };
}

const register = (body) => api('POST', '/api/auth/register', { body: { consent: true, ...body } });
const futureDate = () => { const d = new Date(Date.now() + 3 * 86400000); return d.toISOString().slice(0, 10); };
const productBody = (extra = {}) => ({
  name: 'Bread Box', category: 'Bakery', price: 12000, originalPrice: 20000, quantity: 4,
  expiryDate: futureDate(), pickupEnd: '23:59', ...extra,
});

describe('PLATIFUL API', () => {
  let admin; let retailer; let customer; let other; let product; let order;

  before(async () => {
    await db.init();
    const users = db.read('users').filter((u) => u.role !== 'admin' || false);
    users.push({ id: 'test-admin-id', name: 'Test Admin', email: 'admin@example.test', role: 'admin', ...hashPassword('AdminPassword123') });
    db.write('users', users);
    server = http.createServer(createRequestHandler());
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await db.close();
  });

  it('health check dan file statis', async () => {
    assert.equal((await api('GET', '/api/health')).data.status, 'ok');
    const html = await (await fetch(baseUrl)).text();
    assert.match(html, /<title>PLATIFUL/);
    const traversal = await fetch(`${baseUrl}/..%2f..%2fBack%20end%2fserver.js`);
    assert.notEqual(traversal.status, 200);
  });

  it('waktu lokal mengikuti zona waktu aplikasi', () => {
    // 2026-11-05 17:30 UTC = 2026-11-06 00:30 WIB
    const now = localNow(new Date('2026-11-05T17:30:00Z'), 'Asia/Jakarta');
    assert.deepEqual(now, { date: '2026-11-06', minutes: 30 });
    assert.equal(toMinutes('18:05'), 1085);
    assert.equal(toMinutes('25:00'), null);
  });

  // PBI-01 (FR-01): public registration and sign-in.
  it('registrasi, validasi, dan larangan membuat admin dari form publik', async () => {
    retailer = await register({ name: 'Test Retailer', email: 'retailer@example.test', password: 'RetailerPassword1', role: 'retailer', storeName: 'Test Bakery', storeAddress: 'Road 1' });
    customer = await register({ name: 'Test Customer', email: 'customer@example.test', password: 'CustomerPassword1' });
    other = await register({ name: 'Other Customer', email: 'other@example.test', password: 'OtherPassword1' });
    await api('POST', '/api/auth/register', { status: 400, body: { name: 'Fake', email: 'fake@example.test', password: 'FakeAdminPassword1', role: 'admin', consent: true } });
    await api('POST', '/api/auth/register', { status: 400, body: { name: 'No Consent', email: 'nc@example.test', password: 'Password12345' } });
    await api('POST', '/api/auth/register', { status: 409, body: { consent: true, name: 'Dup', email: 'customer@example.test', password: 'Password12345' } });
    admin = await api('POST', '/api/auth/login', { body: { email: 'admin@example.test', password: 'AdminPassword123' } });
    assert.equal(admin.data.user.role, 'admin');
    assert.equal((await api('GET', '/api/auth/me', { cookie: customer.cookie })).data.user.email, 'customer@example.test');
    await api('GET', '/api/auth/me', { status: 401 });
  });

  it('login dibatasi setelah terlalu banyak percobaan gagal', async () => {
    for (let i = 0; i < 10; i += 1) {
      await api('POST', '/api/auth/login', { status: 401, body: { email: 'brute@example.test', password: 'salah-salah' } });
    }
    await api('POST', '/api/auth/login', { status: 429, body: { email: 'brute@example.test', password: 'salah-salah' } });
  });

  it('login cepat tester bekerja dan bisa dimatikan', async () => {
    assert.equal((await api('GET', '/api/auth/config')).data.demoLogin, true);
    const demo = await api('POST', '/api/auth/demo', { body: { role: 'retailer' } });
    assert.equal(demo.data.user.role, 'retailer');
    assert.equal(demo.data.user.verification, 'approved');
  });

  // Retailer verification submission and admin decision.
  it('retailer harus terverifikasi sebelum memposting produk', async () => {
    await api('POST', '/api/products', { cookie: retailer.cookie, status: 403, body: productBody() });
    await api('POST', '/api/verification', { cookie: retailer.cookie, body: { proof: 'NIB 123' } });
    await api('POST', '/api/verification', { cookie: retailer.cookie, status: 400, body: { proof: '' } });
    await api('POST', '/api/verification', {
      cookie: retailer.cookie,
      status: 400,
      body: { proofImage: { name: 'izin.svg', data: 'data:image/svg+xml;base64,PHN2Zz4=' } },
    });
    await api('POST', '/api/verification', {
      cookie: retailer.cookie,
      status: 400,
      body: { proofImage: { name: 'palsu.png', data: 'data:image/png;base64,SGVsbG8=' } },
    });
    await api('POST', '/api/verification', {
      cookie: retailer.cookie,
      status: 400,
      body: { proofImage: { name: 'besar.png', data: `data:image/png;base64,${'A'.repeat(700000)}` } },
    });
    const proofImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rZkAAAAASUVORK5CYII=';
    await api('POST', '/api/verification', {
      cookie: retailer.cookie,
      body: { proofImage: { name: 'izin-usaha.png', data: proofImage } },
    });
    const list = await api('GET', '/api/admin/verifications', { cookie: admin.cookie });
    const submission = list.data.find((v) => v.id === retailer.data.user.id);
    assert.equal(submission.status, 'pending');
    assert.equal(submission.proofImage.name, 'izin-usaha.png');
    assert.equal(submission.proofImage.type, 'image/png');
    assert.equal(submission.proofImage.data, proofImage);
    await api('PATCH', `/api/admin/verifications/${retailer.data.user.id}`, { cookie: admin.cookie, status: 400, body: { action: 'reject' } });
    await api('PATCH', `/api/admin/verifications/${retailer.data.user.id}`, { cookie: admin.cookie, body: { action: 'approve' } });
    assert.equal((await api('GET', '/api/verification', { cookie: retailer.cookie })).data.status, 'approved');
  });

  // Retailer product listing, public catalog, and filter preferences.
  // product listing, validation, ownership, creation, and search filters.
  it('produk: validasi input dan hak akses', async () => {
    const bad = (extra) => api('POST', '/api/products', { cookie: retailer.cookie, status: 400, body: productBody(extra) });
    await bad({ price: -5 });
    await bad({ price: 'abc' });
    await bad({ originalPrice: 5000 });
    await bad({ quantity: 1.5 });
    await bad({ expiryDate: '' });
    await bad({ pickupEnd: '99:99' });
    await bad({ schedule: [{ time: 'x', price: 1 }] });
    await api('POST', '/api/products', { cookie: customer.cookie, status: 403, body: productBody() });
    product = (await api('POST', '/api/products', { cookie: retailer.cookie, status: 201, body: productBody() })).data;
    await api('PATCH', `/api/products/${product.id}`, { cookie: retailer.cookie, status: 400, body: { price: -1 } });
    await api('PATCH', `/api/products/${product.id}`, { cookie: customer.cookie, status: 403, body: { price: 100 } });
    const patched = await api('PATCH', `/api/products/${product.id}`, { cookie: retailer.cookie, body: { quantity: 5 } });
    assert.equal(patched.data.quantity, 5);
    assert.equal(patched.data.expiryDate, product.expiryDate);
    const catalog = await api('GET', '/api/products', { cookie: customer.cookie });
    assert.ok(catalog.data.some((p) => p.id === product.id));
    assert.ok((await api('GET', '/api/products')).data.length >= 1); // tamu boleh melihat katalog
    assert.equal((await api('GET', '/api/products?halal=1', { cookie: customer.cookie })).data.length, 0);
    assert.equal((await api('GET', '/api/products?search=bread+box', { cookie: customer.cookie })).data.length, 1);
  });

  // Store map data, retailer store details, favorites, and saved filters.
  it('toko, favorit, dan filter tersimpan', async () => {
    await api('PUT', '/api/store', { cookie: retailer.cookie, body: { name: 'Test Bakery', address: 'Road 1', phone: '0812', description: 'Fresh', latitude: -6.2, longitude: 106.8 } });
    await api('PUT', '/api/store', { cookie: retailer.cookie, status: 400, body: { name: 'Test Bakery', address: 'Road 1', latitude: 120, longitude: 200 } });
    const stores = await api('GET', '/api/stores', { cookie: customer.cookie });
    const mine = stores.data.find((s) => s.id === retailer.data.user.id);
    assert.equal(mine.latitude, -6.2);
    assert.equal(mine.productCount, 1);
    await api('PUT', `/api/favorites/${retailer.data.user.id}`, { cookie: customer.cookie });
    assert.equal((await api('GET', '/api/favorites', { cookie: customer.cookie })).data[0].id, retailer.data.user.id);
    await api('DELETE', `/api/favorites/${retailer.data.user.id}`, { cookie: customer.cookie });
    assert.equal((await api('GET', '/api/favorites', { cookie: customer.cookie })).data.length, 0);
    await api('PUT', '/api/filters', { cookie: customer.cookie, body: { maxPrice: '20000', halal: '1', junk: 'x' } });
    assert.deepEqual((await api('GET', '/api/filters', { cookie: customer.cookie })).data, { maxPrice: '20000', halal: '1' });
  });

  // Shared order lifecycle integration: customer order, pickup, and commission.
  it('pesanan: alur penuh, kode pickup, komisi, dan akses', async () => {
    await api('PUT', '/api/admin/commission', { cookie: admin.cookie, body: { rate: 10 } });
    await api('POST', '/api/orders', { cookie: retailer.cookie, status: 403, body: { productId: product.id } });
    await api('POST', '/api/orders', { cookie: customer.cookie, status: 409, body: { productId: product.id, quantity: 99 } });
    order = (await api('POST', '/api/orders', { cookie: customer.cookie, status: 201, body: { productId: product.id, quantity: 2 } })).data;
    assert.match(order.pickupCode, /^\d{6}$/);
    assert.equal(order.total, 24000);
    assert.equal((await api('GET', '/api/orders', { cookie: other.cookie })).data.length, 0);
    assert.equal((await api('GET', '/api/orders', { cookie: retailer.cookie })).data.length, 1);

    const patch = (cookie, body, status = 200) => api('PATCH', `/api/orders/${order.id}`, { cookie, body, status });
    await patch(customer.cookie, { status: 'Completed' }, 403);
    await patch(other.cookie, { status: 'Cancelled' }, 404);
    await patch(retailer.cookie, { status: 'Completed', pickupCode: '000000' }, 403);
    assert.equal((await patch(retailer.cookie, { status: 'Ready for pickup' })).data.status, 'Ready for pickup');
    const done = (await patch(retailer.cookie, { status: 'Completed', pickupCode: order.pickupCode })).data;
    assert.equal(done.status, 'Completed');
    assert.equal(done.commission, 2400);
    await patch(customer.cookie, { status: 'Cancelled' }, 409);

    const second = (await api('POST', '/api/orders', { cookie: customer.cookie, status: 201, body: { productId: product.id, quantity: 1 } })).data;
    await api('PATCH', `/api/orders/${second.id}`, { cookie: customer.cookie, body: { status: 'Cancelled' } });
    const inventory = await api('GET', '/api/products', { cookie: retailer.cookie });
    const mineProduct = inventory.data.find((p) => p.id === product.id);
    assert.equal(mineProduct.quantity, 3); // 5 - 2 pesanan selesai (pembatalan mengembalikan stok)
    assert.ok(mineProduct.currentPrice);
  });

  // Expired products and unavailable orders.
  it('produk kedaluwarsa tidak tampil dan tidak bisa dipesan', async () => {
    const old = (await api('POST', '/api/products', { cookie: retailer.cookie, status: 201, body: productBody({ name: 'Old Bread', expiryDate: '2099-01-01' }) })).data;
    const products = db.read('products');
    products.find((p) => p.id === old.id).expiryDate = '2000-01-01';
    db.write('products', products);
    await api('POST', '/api/orders', { cookie: customer.cookie, status: 409, body: { productId: old.id, quantity: 1 } });
    const names = (await api('GET', '/api/products', { cookie: customer.cookie })).data.map((p) => p.name);
    assert.ok(!names.includes('Old Bread'));
    await api('DELETE', `/api/products/${old.id}`, { cookie: retailer.cookie });
    await api('DELETE', `/api/products/${old.id}`, { cookie: retailer.cookie, status: 404 });
  });

  // Scheduled markdown pricing.
  it('harga bertahap mengikuti jadwal diskon', async () => {
    const stepped = (await api('POST', '/api/products', {
      cookie: retailer.cookie, status: 201,
      body: productBody({ name: 'Stepped', price: 15000, minPrice: 5000, schedule: [{ time: '00:00', price: 9000 }] }),
    })).data;
    const seen = (await api('GET', '/api/products', { cookie: customer.cookie })).data.find((p) => p.id === stepped.id);
    assert.equal(seen.price, 9000);
    const own = (await api('GET', '/api/products', { cookie: retailer.cookie })).data.find((p) => p.id === stepped.id);
    assert.equal(own.price, 15000);
    assert.equal(own.currentPrice, 9000);
  });

  // Retailer no-show handling and account suspension.
  it('no-show mengembalikan stok dan menyuspend setelah 3 kali', async () => {
    const victim = await register({ name: 'No Show', email: 'noshow@example.test', password: 'NoShowPassword1' });
    const before = db.read('products').find((p) => p.id === product.id).quantity;
    for (let i = 0; i < 3; i += 1) {
      const o = (await api('POST', '/api/orders', { cookie: victim.cookie, status: 201, body: { productId: product.id, quantity: 1 } })).data;
      await api('POST', `/api/orders/${o.id}/no-show`, { cookie: retailer.cookie });
    }
    assert.equal(db.read('products').find((p) => p.id === product.id).quantity, before);
    await api('GET', '/api/auth/me', { cookie: victim.cookie, status: 401 });
    const users = (await api('GET', '/api/admin/users', { cookie: admin.cookie })).data;
    const id = users.find((u) => u.email === 'noshow@example.test').id;
    await api('PATCH', `/api/admin/users/${id}`, { cookie: admin.cookie, body: { suspended: false } });
    await api('POST', '/api/auth/login', { body: { email: 'noshow@example.test', password: 'NoShowPassword1' } });
  });

  // Product reports, moderation, store reviews, and retailer sales reports.
  it('laporan produk, moderasi, ulasan, dan laporan retailer', async () => {
    const report = (await api('POST', '/api/reports', { cookie: customer.cookie, status: 201, body: { productId: product.id, reason: 'Incorrect information', details: 'cek' } })).data;
    await api('POST', '/api/reports', { cookie: customer.cookie, status: 400, body: { productId: product.id, reason: 'bukan-alasan' } });
    assert.equal((await api('GET', '/api/reports', { cookie: retailer.cookie })).data[0].id, report.id);
    await api('PATCH', `/api/admin/reports/${report.id}`, { cookie: admin.cookie, body: { status: 'Resolved' } });
    await api('GET', '/api/admin/reports', { cookie: customer.cookie, status: 403 });

    await api('POST', '/api/reviews', { cookie: customer.cookie, status: 400, body: { orderId: order.id, rating: 9 } });
    const review = (await api('POST', '/api/reviews', { cookie: customer.cookie, status: 201, body: { orderId: order.id, rating: 5, comment: 'enak' } })).data;
    await api('POST', '/api/reviews', { cookie: customer.cookie, status: 409, body: { orderId: order.id, rating: 4 } });
    await api('PATCH', `/api/reviews/${review.id}`, { cookie: customer.cookie, status: 400, body: { rating: 0 } });
    assert.equal((await api('GET', `/api/reviews?storeId=${retailer.data.user.id}`)).data.length, 1);

    const periodic = (await api('POST', '/api/retailer/reports', { cookie: retailer.cookie, status: 201, body: { period: '2026-11' } })).data;
    assert.equal(periodic.completed, 1);
    assert.equal(periodic.revenue, 24000);
    assert.equal(periodic.commission, 2400);
    assert.equal((await api('GET', '/api/retailer/reports', { cookie: retailer.cookie })).data.length, 1);
  });

  // Admin summary, articles, users, categories, commission, settlements, and export.
  it('admin: ringkasan, saldo, settlement, artikel, kategori, pengumuman, dan CSV', async () => {
    const summary = (await api('GET', '/api/admin/summary', { cookie: admin.cookie })).data;
    assert.equal(summary.commissionTotal, 2400);
    await api('GET', '/api/admin/summary', { cookie: customer.cookie, status: 403 });
    const balance = (await api('GET', '/api/admin/balances', { cookie: admin.cookie })).data.find((b) => b.retailerId === retailer.data.user.id);
    assert.equal(balance.payable, 21600);
    await api('POST', '/api/admin/settlements', { cookie: admin.cookie, status: 201, body: { retailerId: retailer.data.user.id, amount: 21600, reference: 'TX-1' } });
    const after = (await api('GET', '/api/admin/balances', { cookie: admin.cookie })).data.find((b) => b.retailerId === retailer.data.user.id);
    assert.equal(after.outstanding, 0);

    await api('POST', '/api/admin/articles', { cookie: admin.cookie, status: 201, body: { title: 'Guide', content: 'A practical guide to saving food.', status: 'Published' } });
    await api('POST', '/api/admin/articles', { cookie: admin.cookie, status: 201, body: { title: 'Draft', content: 'A draft article content here.', status: 'Draft' } });
    assert.equal((await api('GET', '/api/articles', { cookie: customer.cookie })).data.length, 1);

    const categories = (await api('POST', '/api/categories', { cookie: admin.cookie, body: { name: 'Drinks' } })).data;
    assert.ok(categories.some((c) => c.name === 'Drinks'));
    await api('POST', '/api/categories', { cookie: retailer.cookie, status: 403, body: { name: 'X' } });

    await api('POST', '/api/admin/announcements', { cookie: admin.cookie, status: 201, body: { title: 'Halo', body: 'Pengumuman' } });
    assert.ok((await api('GET', '/api/notifications', { cookie: customer.cookie })).data.some((n) => /Halo/.test(n.message)));
    assert.equal((await api('GET', '/api/announcements')).data.length, 1);

    const csv = await (await fetch(`${baseUrl}/api/admin/export.csv`, { headers: { Cookie: admin.cookie } })).text();
    assert.match(csv, /komisi_total,2400/);
  });

  // Product templates and order notifications.
  it('template produk dan notifikasi', async () => {
    const template = (await api('POST', '/api/templates', { cookie: retailer.cookie, status: 201, body: { name: 'Tpl', category: 'Bakery', price: 1000 } })).data;
    assert.equal((await api('GET', '/api/templates', { cookie: retailer.cookie })).data.length, 1);
    await api('DELETE', `/api/templates/${template.id}`, { cookie: retailer.cookie });
    const notes = (await api('GET', '/api/notifications', { cookie: retailer.cookie })).data;
    assert.ok(notes.length > 0);
    await api('PATCH', `/api/notifications/${notes[0].id}`, { cookie: retailer.cookie });
    assert.equal((await api('GET', '/api/notifications', { cookie: retailer.cookie })).data.find((n) => n.id === notes[0].id).read, true);
  });

  it('akun: profil, ganti password, dan hapus akun beserta data turunannya', async () => {
    await api('PUT', '/api/account', { cookie: customer.cookie, body: { name: 'Updated', phone: '0813' } });
    await api('PUT', '/api/account/password', { cookie: customer.cookie, body: { currentPassword: 'CustomerPassword1', newPassword: 'ChangedPassword1' } });
    await api('PUT', '/api/account/password', { cookie: customer.cookie, status: 400, body: { currentPassword: 'salah', newPassword: 'AnotherPassword1' } });
    await api('POST', '/api/auth/login', { body: { email: 'customer@example.test', password: 'ChangedPassword1' } });

    const pending = (await api('POST', '/api/orders', { cookie: other.cookie, status: 201, body: { productId: product.id, quantity: 1 } })).data;
    const stock = db.read('products').find((p) => p.id === product.id).quantity;
    await api('DELETE', '/api/account', { cookie: other.cookie, status: 403, body: { password: 'salah' } });
    await api('DELETE', '/api/account', { cookie: other.cookie, body: { password: 'OtherPassword1' } });
    assert.equal(db.read('users').some((u) => u.email === 'other@example.test'), false);
    assert.equal(db.read('products').find((p) => p.id === product.id).quantity, stock + 1);
    assert.equal(db.read('orders').find((o) => o.id === pending.id).status, 'Cancelled');
    await api('GET', '/api/auth/me', { cookie: other.cookie, status: 401 });
    await api('DELETE', '/api/account', { cookie: admin.cookie, status: 409, body: { password: 'AdminPassword123' } });
  });

  it('data bertahan setelah server dimulai ulang', async () => {
    await db.flush();
    await db.init(); // memuat ulang dari MySQL tiruan
    assert.equal((await api('GET', '/api/auth/me', { cookie: customer.cookie })).data.user.email, 'customer@example.test');
    assert.ok(db.read('orders').length >= 1);
  });

  it('logout dan suspend mengakhiri sesi', async () => {
    await api('POST', '/api/auth/logout', { cookie: customer.cookie });
    await api('GET', '/api/auth/me', { cookie: customer.cookie, status: 401 });
  });
});
