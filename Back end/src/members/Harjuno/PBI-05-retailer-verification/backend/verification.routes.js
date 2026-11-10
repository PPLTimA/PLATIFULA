// PBI-05 (FR-05): retailer verification submission.
const db = require('../../../../core/database');
const { HttpError } = require('../../../../core/http');
const { nowIso } = require('../../../../core/time');
const { text } = require('../../../../core/validate');
const { notifyMany } = require('../../../../modules/notifications/notifications.service');

const MAX_PROOF_IMAGE_BYTES = 512 * 1024;
const PROOF_IMAGE_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

function validateProofImage(image) {
  if (image === undefined || image === null || image === '') return null;
  if (typeof image !== 'object' || typeof image.data !== 'string') {
    throw new HttpError(400, 'File bukti harus berupa gambar PNG, JPG, atau WebP.');
  }

  const match = image.data.match(PROOF_IMAGE_PATTERN);
  if (!match) throw new HttpError(400, 'File bukti harus berupa gambar PNG, JPG, atau WebP.');

  const [, type, encoded] = match;
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.toString('base64') !== encoded || bytes.length > MAX_PROOF_IMAGE_BYTES) {
    throw new HttpError(400, 'Ukuran gambar bukti maksimal 512 KB.');
  }
  const isPng = type === 'image/png'
    && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = type === 'image/jpeg'
    && bytes.length >= 3
    && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = type === 'image/webp'
    && bytes.length >= 12
    && bytes.toString('ascii', 0, 4) === 'RIFF'
    && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!isPng && !isJpeg && !isWebp) {
    throw new HttpError(400, 'Isi file tidak sesuai dengan format gambar.');
  }

  return {
    name: text(image.name).slice(0, 120),
    type,
    data: image.data,
  };
}

function register(router) {
  router.get('/api/verification', { roles: ['retailer'] }, (ctx) => {
    ctx.json(200, ctx.user.verification || { status: 'none' });
  });

  router.post('/api/verification', { roles: ['retailer'] }, async (ctx) => {
    const body = await ctx.body();
    const proof = text(body.proof);
    const proofImage = validateProofImage(body.proofImage) || ctx.user.verification?.proofImage;
    if (!proof && !proofImage) throw new HttpError(400, 'Isi bukti usaha atau unggah foto dokumen.');

    const users = db.read('users');
    const me = users.find((account) => account.id === ctx.user.id);
    me.verification = {
      ...me.verification,
      status: 'pending',
      proof,
      ...(proofImage ? { proofImage } : {}),
      submittedAt: nowIso(),
    };
    db.write('users', users);

    notifyMany(
      users.filter((account) => account.role === 'admin').map((admin) => admin.id),
      `Pengajuan verifikasi baru dari ${me.store?.name || me.name}.`,
      { type: 'verify', page: 'verifications' },
    );
    ctx.json(200, me.verification);
  });
}

module.exports = { register };
