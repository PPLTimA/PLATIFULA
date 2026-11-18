// PBI-05: admin retailer verification (daftar pengajuan, detail, dan keputusan).
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { nowIso } = require('../../../../core/time');
const { text } = require('../../../../core/validate');
const { notify } = require('../../../../modules/notifications/notifications.service');

const STATUS_BY_ACTION = { approve: 'approved', reject: 'rejected', revoke: 'revoked' };

// Aksi yang boleh dilakukan admin menurut status verifikasi saat ini.
const ALLOWED_FROM = {
  approve: ['pending', 'rejected', 'revoked'],
  reject: ['pending'],
  revoke: ['approved'],
};

const businessName = (account) => account.verification?.businessName || account.store?.name || account.name;

/** Ringkasan untuk daftar: tanpa isi dokumen supaya respons tetap ringan. */
function summarize(account) {
  const { verification } = account;
  const document = verification.document || verification.proofImage;
  return {
    id: account.id,
    name: businessName(account),
    ownerName: verification.ownerName || '',
    status: verification.status,
    submittedAt: verification.submittedAt || null,
    decidedAt: verification.decidedAt || null,
    reason: verification.reason || '',
    documentType: document?.type || null,
  };
}

/** Detail lengkap untuk halaman tinjau (data lama dengan field `proof`/`proofImage` ikut dibaca). */
function detail(account) {
  const { proof, proofImage, document, notes, ...verification } = account.verification;
  return {
    id: account.id,
    name: businessName(account),
    email: account.email,
    accountName: account.name,
    store: { name: account.store?.name || '', address: account.store?.address || '', phone: account.store?.phone || '' },
    ...verification,
    notes: notes || proof || '',
    document: document || proofImage || null,
  };
}

function register(router) {
  router.get('/api/admin/verifications', { roles: ['admin'] }, (ctx) => {
    ctx.json(200, db.read('users').filter((account) => account.role === 'retailer' && account.verification).map(summarize));
  });

  router.get('/api/admin/verifications/:id', { roles: ['admin'] }, (ctx) => {
    const retailer = db.read('users').find((account) => account.id === ctx.params.id && account.role === 'retailer' && account.verification);
    if (!retailer) throw new HttpError(404, 'Pengajuan verifikasi tidak ditemukan.');
    ctx.json(200, detail(retailer));
  });

  router.patch('/api/admin/verifications/:id', { roles: ['admin'] }, async (ctx) => {
    const body = await ctx.body();
    const status = STATUS_BY_ACTION[body.action];
    const reason = text(body.reason);

    const users = db.read('users');
    const retailer = users.find((account) => account.id === ctx.params.id && account.role === 'retailer');
    if (!retailer || !status) throw new HttpError(400, 'Retailer atau aksi tidak valid.');
    if (!ALLOWED_FROM[body.action].includes(retailer.verification?.status)) {
      throw new HttpError(409, 'Aksi ini tidak dapat dilakukan pada status verifikasi saat ini.');
    }
    if (status !== 'approved' && !reason) throw new HttpError(400, 'Alasan wajib diisi.');

    retailer.verification = { ...(retailer.verification || {}), status, reason, decidedAt: nowIso() };
    db.write('users', users);
    notify(retailer.id, `Verifikasi usaha: ${status}${reason ? ` (${reason})` : ''}.`, { type: 'verify', page: 'verification' });
    ctx.json(200, retailer.verification);
  });
}

module.exports = { register };
