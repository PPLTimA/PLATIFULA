// Waktu lokal (default Asia/Jakarta). Server di cloud biasanya berjalan di UTC,
// jadi tanggal dan jam pengambilan harus dihitung memakai zona waktu aplikasi.
const config = require('../config');

/** Tanggal (YYYY-MM-DD) dan menit sejak tengah malam pada zona waktu aplikasi. */
function localNow(date = new Date(), timeZone = config.timezone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** 'HH:MM' menjadi menit; null bila format tidak valid. */
function toMinutes(time) {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(time || ''));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

const nowIso = () => new Date().toISOString();

module.exports = { localNow, toMinutes, nowIso };
