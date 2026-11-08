# Backend PLATIFUL

Node.js murni (tanpa framework) + MySQL. Panduan lengkap ada di [README utama](../README.md).

## Peta file

```text
server.js                  titik masuk
src/config.js              pengaturan dari environment variable
src/app.js                 router API + file statis
src/core/
  database.js              MySQL + cache memori (read/write per koleksi)
  router.js                router: get/post/put/patch/delete, auth, roles, ctx
  http.js                  HttpError, sendJson, readJsonBody
  static.js                menyajikan folder Front end
  time.js                  jam & tanggal lokal (zona waktu aplikasi)
  validate.js              isEmail, isDate, isHttpUrl, text
  rate-limit.js            pembatas percobaan login
src/members/<anggota>/PBI-xx-<fitur>/backend/
  *.routes.js              subtask API: export register(router)
  *.service.js             subtask aturan bisnis milik PBI
src/modules/
  */                       core/helper bersama dan route kompatibilitas
```

Route fitur per anggota didaftarkan di `src/modules/index.js`; service scheduler terkait PBI-13
dijalankan dari `server.js`. File frontend pasangannya berada di `Front end/js/members/<anggota>/`
dengan nama PBI yang sama, lalu dimuat oleh `Front end/index.html`. File core, helper bersama,
route kompatibilitas, dan tes integrasi tetap terpisah karena digunakan lintas-PBI.

## Menambah endpoint

Tambahkan di file `*.routes.js` modul yang sesuai:

```js
router.get('/api/contoh/:id', { roles: ['retailer'] }, async (ctx) => {
  const body = await ctx.body();             // JSON request
  if (!ctx.params.id) throw new HttpError(400, 'Pesan error');
  ctx.json(200, { ok: true });
});
```

Opsi route: `auth: 'required' | 'optional' | 'none'` (default `required`) dan `roles: [...]`.
Subtask backend baru perlu didaftarkan di `src/modules/index.js`.
