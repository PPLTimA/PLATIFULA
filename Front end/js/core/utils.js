// Fungsi bantu umum. Seluruh aplikasi berbagi satu namespace global: window.App.
window.App = window.App || {};

(() => {
  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  /** Wajib dipakai untuk setiap data dari server/pengguna yang dimasukkan ke HTML. */
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);

  const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

  const formatDateTime = (value) => (value ? new Date(value).toLocaleString('id-ID') : '-');

  const shortId = (id) => String(id || '').slice(0, 8).toUpperCase();

  const initials = (name) => String(name || 'PL')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formToObject = (form) => Object.fromEntries(new FormData(form));

  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  App.utils = { debounce, escapeHtml, formatDateTime, formatRupiah, formToObject, initials, shortId };
})();
