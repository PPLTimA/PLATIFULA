// State global aplikasi (sengaja kecil): siapa yang login dan halaman mana yang aktif.
window.App = window.App || {};
App.state = {
  user: null,       // { id, name, email, role, store?, verification? }
  page: null,       // id halaman yang sedang ditampilkan
  demoLogin: false, // apakah tombol "Masuk cepat" ditampilkan
};
