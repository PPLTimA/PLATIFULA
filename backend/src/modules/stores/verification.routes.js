// Verifikasi usaha retailer: retailer mengajukan, admin menyetujui/menolak/mencabut.
const db = require('../../core/database');
const { HttpError } = require('../../core/http');
const { nowIso } = require('../../core/time');
const { text } = require('../../core/validate');
const { notify, notifyMany } = require('../notifications/notifications.service');

const STATUS_BY_ACTION = { approve: 'approved', reject: 'rejected', revoke: 'revoked' };

function register(router) {
  router.get('/api/verification', { roles: ['retailer'] }, (ctx) => {
    ctx.json(200, ctx.user.verification || { status: 'none' });
  });

  router.post('/api/verification', { roles: ['retailer'] }, async (ctx) => {
    const proof = text((await ctx.body()).proof);
    if (!proof) throw new HttpError(400, 'Bukti usaha wajib diisi.');

    const users = db.read('users');
    const me = users.find((account) => account.id === ctx.user.id);
    me.verification = { status: 'pending', proof, submittedAt: nowIso() };
    db.write('users', users);

    notifyMany(
      users.filter((account) => account.role === 'admin').map((admin) => admin.id),
      `Pengajuan verifikasi baru dari ${me.store?.name || me.name}.`,
    );
    ctx.json(200, me.verification);
  });

  router.get('/api/admin/verifications', { roles: ['admin'] }, (ctx) => {
    ctx.json(200, db.read('users')
      .filter((account) => account.verification)
      .map((account) => ({ id: account.id, name: account.store?.name || account.name, ...account.verification })));
  });

  router.patch('/api/admin/verifications/:id', { roles: ['admin'] }, async (ctx) => {
    const body = await ctx.body();
    const status = STATUS_BY_ACTION[body.action];
    const reason = text(body.reason);

    const users = db.read('users');
    const retailer = users.find((account) => account.id === ctx.params.id && account.role === 'retailer');
    if (!retailer || !status) throw new HttpError(400, 'Retailer atau aksi tidak valid.');
    if (status !== 'approved' && !reason) throw new HttpError(400, 'Alasan wajib diisi.');

    retailer.verification = { ...(retailer.verification || {}), status, reason, decidedAt: nowIso() };
    db.write('users', users);
    notify(retailer.id, `Verifikasi usaha: ${status}${reason ? ` (${reason})` : ''}.`);
    ctx.json(200, retailer.verification);
  });
}

module.exports = { register };
