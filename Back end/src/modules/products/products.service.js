// Shared product validation and expiry helpers.
const { isDate, isHttpUrl, text } = require('../../core/validate');
const { localNow, toMinutes } = require('../../core/time');
const { effectivePrice } = require('../../members/Kenneth Nathaniel Tirtadjaja/PBI-13-discount-schedule/backend/pricing.service');

/**
 * Memvalidasi dan menormalkan input produk.
 * - `existing`: produk lama (untuk PATCH); field yang tidak dikirim memakai nilai lama.
 * Mengembalikan `{ value }` atau `{ error }`.
 */
function normalizeProduct(input, existing = null) {
  const merged = { ...(existing || {}), ...input };
  const creating = !existing;

  const value = {
    name: text(merged.name),
    category: text(merged.category),
    price: Number(merged.price),
    originalPrice: Number(merged.originalPrice),
    quantity: Number(merged.quantity),
    expiryDate: text(merged.expiryDate),
    pickupStart: text(merged.pickupStart),
    pickupEnd: text(merged.pickupEnd),
    photo: text(merged.photo),
    halal: Boolean(merged.halal),
    minPrice: Number(merged.minPrice) || 0,
    schedule: Array.isArray(merged.schedule) ? merged.schedule : [],
  };

  const problems = [];
  if (!value.name) problems.push('nama');
  if (!value.category) problems.push('kategori');
  if (!Number.isFinite(value.price) || value.price < 1) problems.push('harga promo');
  if (!Number.isFinite(value.originalPrice) || value.originalPrice < value.price) problems.push('harga normal (minimal sama dengan harga promo)');
  if (!Number.isInteger(value.quantity) || value.quantity < (creating ? 1 : 0)) problems.push('stok');
  if (value.minPrice < 0 || value.minPrice > value.price) problems.push('harga terendah');
  if (value.expiryDate ? !isDate(value.expiryDate) : creating) problems.push('tanggal kedaluwarsa');
  if (value.pickupStart && toMinutes(value.pickupStart) === null) problems.push('jam pengambilan mulai');
  if (value.pickupEnd ? toMinutes(value.pickupEnd) === null : creating) problems.push('jam pengambilan selesai');
  if (value.photo && !isHttpUrl(value.photo)) problems.push('URL foto');

  value.schedule = value.schedule.map((step) => ({ time: text(step?.time), price: Number(step?.price) }));
  if (value.schedule.some((step) => toMinutes(step.time) === null || !(step.price > 0))) {
    problems.push('jadwal diskon (format [{"time":"18:00","price":8000}])');
  }

  return problems.length
    ? { error: `Periksa kembali: ${problems.join(', ')}.` }
    : { value };
}

function isExpired(product, now = localNow()) {
  if (product.status === 'Expired') return true;
  if (!product.expiryDate) return false;
  if (product.expiryDate < now.date) return true;
  return product.expiryDate === now.date
    && Boolean(product.pickupEnd)
    && toMinutes(product.pickupEnd) < now.minutes;
}

/** Bentuk produk untuk respons API. Retailer melihat harga dasar + `currentPrice`. */
function presentProduct(product, { forOwner = false, now = localNow() } = {}) {
  const current = effectivePrice(product, now);
  return forOwner
    ? { ...product, currentPrice: current, expired: isExpired(product, now) }
    : { ...product, price: current };
}

module.exports = { effectivePrice, isExpired, normalizeProduct, presentProduct };
