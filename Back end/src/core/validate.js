// Fungsi validasi kecil yang dipakai bersama oleh beberapa modul.
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(String(value || ''));
const text = (value) => String(value ?? '').trim();

module.exports = { isEmail, isDate, isHttpUrl, text };
