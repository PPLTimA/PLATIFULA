# PBI-20 — Skenario UAT

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| UAT-20-01 | Retailer menandai pesanan terbuka miliknya no-show | Status order berubah menjadi `No-show`, stok produk kembali, dan hitungan customer bertambah satu. |
| UAT-20-02 | Retailer menandai order milik gerai lain | Server menolak permintaan. |
| UAT-20-03 | Order sudah selesai atau dibatalkan | Order tidak dapat diubah menjadi no-show. |
| UAT-20-04 | Customer atau admin memanggil endpoint retailer | Server menolak akses berdasarkan peran. |
| UAT-20-05 | Customer mencapai batas 3 kejadian | Akun ditangguhkan dan login berikutnya ditolak. |
| UAT-20-06 | Admin mengaktifkan kembali customer | Status aktif; penghitung no-show direset ke nol. |
| UAT-20-07 | Produk sudah dihapus sebelum pemulihan stok | Status/count tetap dicatat tanpa membuat produk baru. |
