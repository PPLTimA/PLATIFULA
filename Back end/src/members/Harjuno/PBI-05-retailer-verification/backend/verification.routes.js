// PBI-05 (FR-05): retailer verification submission (data usaha + dokumen izin usaha).
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { nowIso } = require('../../../../core/time');
const { text } = require('../../../../core/validate');
const { notifyMany } = require('../../../../modules/notifications/notifications.service');

const MAX_DOCUMENT_BYTES = 512 * 1024;
const DOCUMENT_PATTERN = /^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/;
const BUSINESS_TYPES = [
  'Restoran / Kafe',
  'Toko roti / Bakery',
  'Toko kelontong / Minimarket',
  'Katering',
  'Hotel',
  'Lainnya',
];

const hasPrefix = (bytes, signature) => bytes.length >= signature.length
  && signature.every((value, index) => bytes[index] === value);

/** Dokumen izin usaha: PDF, PNG, JPG, atau WebP maksimal 512 KB, isinya dicek dari byte awalnya. */
function validateDocument(document) {
  if (document === undefined || document === null || document === '') return null;
  const formatError = 'Dokumen harus berupa PDF, PNG, JPG, atau WebP.';
  if (typeof document !== 'object' || typeof document.data !== 'string') throw new HttpError(400, formatError);

  const match = document.data.match(DOCUMENT_PATTERN);
  if (!match) throw new HttpError(400, formatError);

  const [, type, encoded] = match;
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.toString('base64') !== encoded || bytes.length > MAX_DOCUMENT_BYTES) {
    throw new HttpError(400, 'Ukuran dokumen maksimal 512 KB.');
  }
  const valid = {
    'image/png': () => hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'image/jpeg': () => hasPrefix(bytes, [0xff, 0xd8, 0xff]),
    'image/webp': () => bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
    'application/pdf': () => bytes.toString('ascii', 0, 5) === '%PDF-',
  }[type]();
  if (!valid) throw new HttpError(400, 'Isi file tidak sesuai dengan formatnya.');

  return { name: text(document.name).slice(0, 120), type, data: document.data };
}

/** Membaca dan memvalidasi isian formulir pengajuan. */
function readBusinessForm(body) {
  const form = {
    businessName: text(body.businessName),
    ownerName: text(body.ownerName),
    nib: text(body.nib),
    businessType: text(body.businessType),
    address: text(body.address),
    phone: text(body.phone),
    notes: text(body.notes),
  };

  const labels = {
    businessName: 'nama usaha', ownerName: 'nama pemilik', nib: 'nomor NIB',
    businessType: 'jenis usaha', address: 'alamat usaha', phone: 'nomor telepon',
  };
  const missing = Object.keys(labels).filter((key) => !form[key]);
  if (missing.length) throw new HttpError(400, `Lengkapi ${missing.map((key) => labels[key]).join(', ')}.`);

  if (form.businessName.length > 100 || form.ownerName.length > 100) {
    throw new HttpError(400, 'Nama usaha dan nama pemilik maksimal 100 karakter.');
  }
  if (!/^[A-Za-z0-9./\- ]{5,30}$/.test(form.nib)) throw new HttpError(400, 'Nomor NIB tidak valid (5-30 karakter huruf, angka, atau tanda baca sederhana).');
  if (!BUSINESS_TYPES.includes(form.businessType)) throw new HttpError(400, 'Pilih jenis usaha yang tersedia.');
  if (form.address.length > 255) throw new HttpError(400, 'Alamat usaha maksimal 255 karakter.');
  const digits = form.phone.replace(/\D/g, '');
  if (!/^[0-9+\-() ]+$/.test(form.phone) || digits.length < 8 || digits.length > 15) {
    throw new HttpError(400, 'Nomor telepon tidak valid.');
  }
  if (form.notes.length > 500) throw new HttpError(400, 'Keterangan tambahan maksimal 500 karakter.');
  return form;
}

function register(router) {
  router.get('/api/verification', { roles: ['retailer'] }, (ctx) => {
    ctx.json(200, ctx.user.verification || { status: 'none' });
  });

  router.get('/api/verification/options', { roles: ['retailer'] }, (ctx) => {
    ctx.json(200, { businessTypes: BUSINESS_TYPES });
  });

  router.post('/api/verification', { roles: ['retailer'] }, async (ctx) => {
    if (ctx.user.verification?.status === 'approved') {
      throw new HttpError(409, 'Usaha kamu sudah terverifikasi, tidak perlu mengajukan lagi.');
    }
    const body = await ctx.body();
    const form = readBusinessForm(body);
    const previous = ctx.user.verification || {};
    const document = validateDocument(body.document ?? body.proofImage) || previous.document || previous.proofImage;
    if (!document) throw new HttpError(400, 'Unggah dokumen izin usaha (PDF, PNG, JPG, atau WebP).');

    const users = db.read('users');
    const me = users.find((account) => account.id === ctx.user.id);
    const { proof, proofImage, ...rest } = me.verification || {}; // buang field format lama
    me.verification = { ...rest, ...form, document, status: 'pending', submittedAt: nowIso() };
    db.write('users', users);

    notifyMany(
      users.filter((account) => account.role === 'admin').map((admin) => admin.id),
      `Pengajuan verifikasi baru dari ${form.businessName}.`,
      { type: 'verify', page: 'verifications' },
    );
    ctx.json(200, me.verification);
  });
}

module.exports = { register };
