# PBI-03 — Skenario UAT

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| UAT-03-01 | Admin membuka daftar pengguna | Data akun tampil; filter peran membatasi customer, retailer, atau admin. |
| UAT-03-02 | Admin memilih status Aktif atau Suspended | Tabel hanya menampilkan akun dengan status yang dipilih. |
| UAT-03-03 | Admin menambah admin dengan email valid dan unik | Admin baru tersimpan dan muncul di daftar. |
| UAT-03-04 | Email duplikat atau password kurang dari 8 karakter | Server menolak permintaan dengan validasi. |
| UAT-03-05 | Admin menangguhkan lalu mengaktifkan customer | Status berubah; saat diaktifkan, hitungan no-show kembali nol. |
| UAT-03-06 | Pengguna non-admin mengakses API admin | Server menolak akses. |
| UAT-03-07 | Admin menghapus akun customer | Akun dan data turunannya dibersihkan; pesanan terbuka dibatalkan dan stok dipulihkan bila relevan. |
| UAT-03-08 | Admin mencoba menghapus akun sendiri | Server menolak permintaan. |
