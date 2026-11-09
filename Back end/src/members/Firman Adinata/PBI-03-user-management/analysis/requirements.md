# PBI-03 — Manajemen Akun Pengguna

## Tujuan

Admin dapat melihat akun, memfilter berdasarkan peran dan status, menambah admin, menangguhkan atau
mengaktifkan akun, serta menghapus akun beserta data turunannya.

## Subtask

- **API:** `backend/routes.js` — daftar akun, pembuatan admin, suspend/aktivasi, dan penghapusan.
- **UI:** `frontend/page.js` — tabel pengguna, filter peran/status, dan aksi admin.
- **Data bersama:** `Back end/src/modules/account/account.service.js` menghapus relasi turunan dan
  menyelesaikan pesanan terbuka sebelum akun dihapus.

## Aturan dan batasan

- Endpoint pengelolaan hanya untuk admin.
- Akun admin lain dan akun admin yang sedang login tidak dapat di-suspend melalui endpoint ini.
- Admin tidak dapat menghapus akunnya sendiri.
- Email admin baru harus valid dan unik; password minimal 8 karakter.
- Aktivasi akun mengatur ulang hitungan no-show menjadi nol.
