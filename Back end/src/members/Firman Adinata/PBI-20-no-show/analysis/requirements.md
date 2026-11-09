# PBI-20 — Blokir dan Catatan No-Show

## Tujuan

Retailer mencatat pesanan yang tidak diambil. Sistem menyimpan status no-show pada pesanan,
mengembalikan stok, menghitung kejadian per customer, dan menangguhkan customer setelah batas
konfigurasi tercapai.

## Subtask

- **API:** `backend/routes.js` menerima aksi no-show hanya untuk pesanan terbuka milik retailer.
- **UI:** `frontend/actions.view.js` menampilkan aksi no-show pada pesanan yang masih berjalan.
- **Integrasi:** `Back end/src/modules/orders/orders.service.js` membagikan status dan pemulihan stok;
  konfigurasi `noShowLimit` saat ini bernilai 3.
- **Admin:** PBI-03 menampilkan jumlah no-show dan menyediakan aktivasi akun; aktivasi mengatur ulang
  hitungan no-show.

## Aturan dan batasan

- Catatan kejadian disimpan sebagai status `No-show` pada order dan `noShowCount` pada akun customer;
  belum ada tabel audit atau kolom catatan bebas tersendiri.
- Pesanan selesai, dibatalkan, atau bukan milik retailer tidak dapat ditandai no-show.
- Setiap kejadian mengembalikan kuantitas ke produk jika produk tersebut masih ada.
