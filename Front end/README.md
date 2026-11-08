# Frontend PLATIFUL

SPA vanilla JS tanpa build tool. Semua script dimuat dari `index.html` secara berurutan dan berbagi satu
namespace global `App`. Panduan lengkap ada di [README utama](../README.md).

## Peta file

```text
css/                       base.css, auth.css, app-ui.css, layout.css
js/core/                   utils, state, ui (head/panel/stat/toast), api (fetch), events (delegasi), router
js/layout/shell.js         sidebar, menu sesuai peran, kartu misi, profil
js/members/<nama>/PBI-xx/  source PBI per anggota, dipisah ke subtask frontend/
js/app.js                  memulai aplikasi
```

## Menambah halaman

Tempatkan halaman di `js/members/<nama>/<PBI>/frontend/`, lalu tambahkan `<script>` ke
`index.html` sebelum `js/app.js`. Gunakan nama member dan PBI yang sama dengan implementasi backend
di `Back end/src/members/`. Urutan script penting bila halaman memakai komponen dari PBI lain.

```js
(() => {
  const { head, panel } = App.ui;

  App.events.on('click', '[data-contoh]', async (button) => {   // aksi tombol
    await App.api.post('/api/contoh', { id: button.dataset.contoh });
    await App.router.refresh();
  });

  App.router.registerPage({
    id: 'contoh', label: 'Contoh', icon: '★', roles: ['customer'], order: 35,
    async render() {
      const data = await App.api.get('/api/contoh');
      return head('KICKER', 'Judul', 'Deskripsi') + panel('Isi', '...');
    },
  });
})();
```

Aturan: data dari server/pengguna **wajib** lewat `App.utils.escapeHtml` sebelum masuk HTML.
