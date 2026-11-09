# PBI-04 — Kategori Produk

## Tujuan

Admin mengelola daftar kategori yang digunakan retailer ketika membuat listing dan customer ketika
memfilter katalog.

## Subtask

- **API baca:** `backend/public.routes.js` menyediakan daftar kategori dan nilai awal jika koleksi
  kategori belum diisi.
- **API admin:** `backend/admin.routes.js` menambah, mengubah, dan menghapus kategori.
- **UI admin:** `frontend/page.js` menampilkan kategori serta formulir tambah, ubah, dan hapus.
- **Integrasi:** formulir produk dan filter katalog membaca `GET /api/categories`.

## Aturan dan batasan

- Daftar kategori dapat dibaca tanpa autentikasi; perubahan hanya untuk admin.
- Nama kategori wajib berisi teks setelah normalisasi.
- Kategori awal: Bakery, Meals, Produce, dan Other.
- Saat ini penghapusan kategori tidak mengubah produk yang telah menyimpan nama kategori tersebut.
