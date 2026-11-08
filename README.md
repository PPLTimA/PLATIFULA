# PLATIFUL — Food Rescue Platform

Marketplace makanan surplus: retailer menjual makanan yang hampir tidak terjual dengan harga promo,
customer memesan dan mengambilnya (cash on pickup), admin menjaga kualitas platform.

## Struktur proyek

```text
Back end/                         Node.js + MySQL (tanpa framework)
  server.js                       titik masuk: koneksi DB, scheduler, HTTP server
  package.json
  seed/                           data awal (diimpor sekali ke MySQL saat pertama jalan)
  scripts/create-admin.js         membuat admin pertama dari environment variable
  tests/run.js                    tes integrasi lintas-PBI (alur dan state bersama)
  src/
    config.js                     semua pengaturan dari environment variable
    app.js                        merangkai router API + file statis
    core/                         database, router, http, static, time, validate, rate-limit
    members/<nama>/PBI-xx/         subtask backend dan analisis sesuai pembagian anggota
    modules/                       helper bersama, penyimpanan, dan route kompatibilitas
Front end/                        SPA vanilla JS (tanpa build tool)
  index.html                      kerangka halaman + urutan pemuatan script
  css/                            base, auth, app-ui, layout
  js/
    core/                         utils, state, ui, api, events, router
    layout/shell.js               sidebar, menu per peran, profil
    members/<nama>/PBI-xx/         subtask frontend per anggota dan PBI
    app.js                        memulai aplikasi
```

Setiap PBI memiliki subfolder `backend/` dan/atau `frontend/` berisi kode yang benar-benar dipakai
aplikasi. Struktur anggota dicerminkan di dua lokasi karena backend dan frontend memiliki runtime
serta folder penyajian yang berbeda. Backend terhubung melalui `Back end/src/modules/index.js`;
frontend dimuat melalui `Front end/index.html`. File helper bersama tetap di `Back end/src/modules/`
agar tidak disalin dan perilakunya konsisten. Folder-folder ini mengelompokkan source sesuai
pembagian kerja; kontribusi tetap perlu dikerjakan dan di-commit oleh anggota masing-masing.

## PIC / pemilik tugas dan file per PBI

PIC mengikuti pembagian tugas kelompok yang diberikan. Ini menunjukkan penanggung jawab PBI dan
letak source terkait; bukan catatan siapa yang sudah menulis atau melakukan commit kode.

| PBI | PIC | File backend | File frontend |
|---|---|---|---|
| 01 — Akun dan autentikasi | Ghefira Zahira Zulfa | `Back end/src/members/Ghefira Zahira Zulfa/PBI-01-accounts-authentication/backend/auth.routes.js`, `account.routes.js` | `Front end/js/members/Ghefira Zahira Zulfa/PBI-01-accounts-authentication/frontend/auth.page.js`, `account.page.js`, `customer-dashboard.page.js` |
| 02 — Manajemen gerai retailer | Ghefira Zahira Zulfa | `Back end/src/members/Ghefira Zahira Zulfa/PBI-02-retailer-store-management/backend/routes.js` | `Front end/js/members/Ghefira Zahira Zulfa/PBI-02-retailer-store-management/frontend/page.js` |
| 03 — Manajemen akun pengguna | Firman Adinata | `Back end/src/members/Firman Adinata/PBI-03-user-management/backend/routes.js` | `Front end/js/members/Firman Adinata/PBI-03-user-management/frontend/page.js` |
| 04 — Kategori produk | Firman Adinata | `Back end/src/members/Firman Adinata/PBI-04-product-categories/backend/public.routes.js`, `admin.routes.js` | `Front end/js/members/Firman Adinata/PBI-04-product-categories/frontend/page.js` |
| 05 — Verifikasi retailer (bukti teks atau unggah gambar PNG/JPG/WebP maks. 512 KB) | Harjuno | `Back end/src/members/Harjuno/PBI-05-retailer-verification/backend/verification.routes.js`, `admin-decisions.routes.js` | `Front end/js/members/Harjuno/PBI-05-retailer-verification/frontend/retailer-verification.page.js`, `admin-decisions.page.js` |
| 06 — Notifikasi in-app | Harjuno | `Back end/src/members/Harjuno/PBI-06-in-app-notifications/backend/routes.js` | `Front end/js/members/Harjuno/PBI-06-in-app-notifications/frontend/page.js` |
| 07 — Produk surplus | Malika Khansa Tsabita | `Back end/src/members/Malika Khansa Tsabita/PBI-07-surplus-products/backend/routes.js` | `Front end/js/members/Malika Khansa Tsabita/PBI-07-surplus-products/frontend/page.js` |
| 08 — Template produk | Malika Khansa Tsabita | `Back end/src/members/Malika Khansa Tsabita/PBI-08-product-templates/backend/routes.js` | `Front end/js/members/Malika Khansa Tsabita/PBI-08-product-templates/frontend/page.js` |
| 09 — Katalog, peta, dan gerai favorit | Zaskia Khansa Salviadi | `Back end/src/members/Zaskia Khansa Salviadi/PBI-09-catalog-map-favorites/backend/catalog.routes.js`, `map.routes.js`, `favorites.routes.js` | `Front end/js/members/Zaskia Khansa Salviadi/PBI-09-catalog-map-favorites/frontend/catalog.page.js`, `map.page.js`, `favorites.page.js` |
| 10 — Pelaporan pengguna/listing | Zaskia Khansa Salviadi | `Back end/src/members/Zaskia Khansa Salviadi/PBI-10-product-reports/backend/routes.js` | `Front end/js/members/Zaskia Khansa Salviadi/PBI-10-product-reports/frontend/report-form.view.js`, `my-reports.page.js`, `retailer-reports.page.js` |
| 11 — Pesanan pelanggan | Kenneth Nathaniel Tirtadjaja | `Back end/src/members/Kenneth Nathaniel Tirtadjaja/PBI-11-customer-orders/backend/create.routes.js`, `history.routes.js`, `pickup-code.service.js` | `Front end/js/members/Kenneth Nathaniel Tirtadjaja/PBI-11-customer-orders/frontend/create-order.view.js`, `history.page.js`, `pickup-code.view.js` |
| 12 — Penanganan pesanan retailer | Kenneth Nathaniel Tirtadjaja | `Back end/src/members/Kenneth Nathaniel Tirtadjaja/PBI-12-retailer-orders-pickup/backend/list.routes.js`, `pickup.routes.js` | `Front end/js/members/Kenneth Nathaniel Tirtadjaja/PBI-12-retailer-orders-pickup/frontend/orders.page.js`, `pickup.page.js` |
| 13 — Jadwal diskon dan harga terendah | Kenneth Nathaniel Tirtadjaja | `Back end/src/members/Kenneth Nathaniel Tirtadjaja/PBI-13-discount-schedule/backend/pricing.service.js`, `scheduler.js` | `Front end/js/members/Kenneth Nathaniel Tirtadjaja/PBI-13-discount-schedule/frontend/view.js` |
| 14 — Komisi platform | Kenneth Nathaniel Tirtadjaja | `Back end/src/members/Kenneth Nathaniel Tirtadjaja/PBI-14-platform-commission/backend/routes.js`, `commission.service.js` | `Front end/js/members/Kenneth Nathaniel Tirtadjaja/PBI-14-platform-commission/frontend/page.js` |
| 15 — Ulasan dan rating gerai | Ghefira Zahira Zulfa | `Back end/src/members/Ghefira Zahira Zulfa/PBI-15-store-reviews/backend/public.routes.js`, `customer.routes.js` | `Front end/js/members/Ghefira Zahira Zulfa/PBI-15-store-reviews/frontend/page.js` |
| 16 — Moderasi laporan | Malika Khansa Tsabita | `Back end/src/members/Malika Khansa Tsabita/PBI-16-report-moderation/backend/routes.js` | `Front end/js/members/Malika Khansa Tsabita/PBI-16-report-moderation/frontend/page.js` |
| 17 — Dashboard dan laporan retailer | Malika Khansa Tsabita | `Back end/src/members/Malika Khansa Tsabita/PBI-17-retailer-dashboard-reports/backend/routes.js` | `Front end/js/members/Malika Khansa Tsabita/PBI-17-retailer-dashboard-reports/frontend/dashboard.page.js`, `reports.page.js` |
| 18 — Dashboard dan ekspor statistik admin | Harjuno | `Back end/src/members/Harjuno/PBI-18-admin-statistics-export/backend/routes.js` | `Front end/js/members/Harjuno/PBI-18-admin-statistics-export/frontend/dashboard.page.js`, `export.view.js` |
| 19 — Pengumuman platform | Harjuno | `Back end/src/members/Harjuno/PBI-19-platform-announcements/backend/routes.js` | `Front end/js/members/Harjuno/PBI-19-platform-announcements/frontend/page.js` |
| 20 — Blokir dan catatan no-show | Firman Adinata | `Back end/src/members/Firman Adinata/PBI-20-no-show/backend/routes.js` | `Front end/js/members/Firman Adinata/PBI-20-no-show/frontend/actions.view.js` |
| 21 — Filter produk | Zaskia Khansa Salviadi | `Back end/src/members/Zaskia Khansa Salviadi/PBI-21-product-filters/backend/routes.js` | `Front end/js/members/Zaskia Khansa Salviadi/PBI-21-product-filters/frontend/view.js` |
| 22 — Artikel edukasi | Zaskia Khansa Salviadi | `Back end/src/members/Zaskia Khansa Salviadi/PBI-22-education-articles/backend/public.routes.js`, `admin.routes.js` | `Front end/js/members/Zaskia Khansa Salviadi/PBI-22-education-articles/frontend/public.page.js`, `admin.page.js` |

Di dalam setiap folder PBI, `backend/` dan `frontend/` adalah subtask implementasi. PBI 03, 04,
dan 20 milik Firman juga berisi `analysis/requirements.md`, `analysis/conceptual-erd.md`, dan
`analysis/uat.md`. `Back end/tests/run.js` tetap satu suite integrasi karena skenario berbagi data
dan urutan lifecycle.

## Tutorial commit tugas ke GitHub

### Persiapan repo bersama (cukup satu orang)

Folder proyek yang dibagikan saat ini belum menjadi repository Git. Buat repository baru di GitHub
tanpa README/license tambahan, lalu buka PowerShell di folder proyek ini dan jalankan sekali:

```powershell
git init -b main
git add .
git status
git commit -m "Initial project import"
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Ganti URL dengan URL repository kelompok. Sebelum commit, periksa `git status`; pastikan file
rahasia seperti `.env` tidak ikut masuk. `.gitignore` proyek sudah mengecualikan `.env` dan
`node_modules/`. Setelah repo awal tersedia, tambahkan teman sebagai collaborator di GitHub.

### Alur tiap anggota

Setiap anggota clone repository **sekali**. Buka PowerShell di tempat folder proyek ingin disimpan:

```powershell
git clone https://github.com/USERNAME/NAMA-REPO.git
cd NAMA-REPO
git switch main
git pull origin main
git switch -c feature/pbi-XX-nama-singkat
```

Ganti `XX` dan nama branch sesuai PBI yang dikerjakan. Setelah mengubah file, dari root repo jalankan
`git add` untuk folder anggota sendiri seperti pada tabel berikut. Tanda kutip diperlukan karena
nama folder berisi spasi.

| Anggota | PBI | Perintah stage file tugasnya |
|---|---|---|
| Harjuno | 05, 06, 18, 19 | `git add -- "Back end/src/members/Harjuno" "Front end/js/members/Harjuno"` |
| Firman Adinata | 03, 04, 20 | `git add -- "Back end/src/members/Firman Adinata" "Front end/js/members/Firman Adinata"` |
| Ghefira Zahira Zulfa | 01, 02, 15 | `git add -- "Back end/src/members/Ghefira Zahira Zulfa" "Front end/js/members/Ghefira Zahira Zulfa"` |
| Malika Khansa Tsabita | 07, 08, 16, 17 | `git add -- "Back end/src/members/Malika Khansa Tsabita" "Front end/js/members/Malika Khansa Tsabita"` |
| Zaskia Khansa Salviadi | 09, 10, 21, 22 | `git add -- "Back end/src/members/Zaskia Khansa Salviadi" "Front end/js/members/Zaskia Khansa Salviadi"` |
| Kenneth Nathaniel Tirtadjaja | 11, 12, 13, 14 | `git add -- "Back end/src/members/Kenneth Nathaniel Tirtadjaja" "Front end/js/members/Kenneth Nathaniel Tirtadjaja"` |

Folder backend/frontend di atas berisi file kode tiap PBI. Rincian **nama file per PBI** ada pada tabel
[PIC / pemilik tugas dan file per PBI](#pic--pemilik-tugas-dan-file-per-pbi). Dokumen analisis
PBI 03/04/20 Firman ikut ter-stage bersama folder backend-nya.

Sebelum commit, cek file yang akan masuk dan jalankan tes backend:

```powershell
git status --short
git diff --cached --name-only
git diff --cached --check
Push-Location "Back end"
npm test
Pop-Location
```

Pastikan daftar staged hanya memuat file tugasmu. `Back end/tests/run.js`, README, `index.html`,
`Back end/src/modules/index.js`, dan helper bersama adalah file integrasi bersama—jangan ikut
di-commit atas nama satu PBI tanpa koordinasi kelompok.

Jika sudah sesuai, commit dan push branch:

```powershell
git commit -m "Implement PBI-XX: ringkasan perubahan"
git push -u origin feature/pbi-XX-nama-singkat
```

Lalu buka repository di GitHub, pilih **Compare & pull request**, ajukan pull request ke `main`,
dan minta anggota lain meninjau. Setelah pull request digabung, sebelum mulai PBI berikutnya:

```powershell
git switch main
git pull origin main
git switch -c feature/pbi-YY-nama-singkat
```

Hindari `git add .` untuk commit tugas harian agar perubahan teman atau file bersama tidak ikut
ter-commit tanpa sengaja.

## Menjalankan

1. Nyalakan **MySQL** di XAMPP (Apache tidak diperlukan).
2. Buka terminal di folder `Back end`, lalu:
   ```
   npm install
   npm start
   ```
3. Buka `http://localhost:3000`.

Database `tubes_ppl` dan semua tabelnya dibuat otomatis. Pengaturan lewat environment variable
(PowerShell: `$env:NAMA="nilai"; npm start`):

| Variable | Default | Keterangan |
|---|---|---|
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | alamat MySQL |
| `DB_USER` / `DB_PASSWORD` | `root` / kosong | akun MySQL |
| `DB_NAME` | `tubes_ppl` | nama database |
| `PORT` | `3000` | port aplikasi |
| `APP_TIMEZONE` | `Asia/Jakarta` | zona waktu untuk jam pickup dan kedaluwarsa |
| `DEMO_LOGIN` | aktif | `off` untuk mematikan tombol "Masuk cepat" (otomatis mati bila `NODE_ENV=production`) |
| `COOKIE_SECURE` | `false` | `true` bila dilayani lewat HTTPS |

Akun tester untuk mencoba: klik tombol **Masuk cepat** (Customer / Retailer / Admin) di halaman login.

### Membuat admin sendiri

```
$env:PLATIFUL_ADMIN_EMAIL="admin@contoh.com"
$env:PLATIFUL_ADMIN_NAME="Admin"
$env:PLATIFUL_ADMIN_PASSWORD="minimal-12-karakter"
npm run create-admin
```

Setelah itu hapus variabel password dari terminal.

## Tes

```
npm test
```

Menjalankan 18 skenario integrasi (registrasi, verifikasi retailer, validasi produk, pesanan,
komisi, no-show, hapus akun, dst.). Tes memakai MySQL tiruan di memori, jadi **tidak butuh XAMPP dan
tidak menyentuh database aslimu**.

## Alur bisnis singkat

1. Retailer mendaftar → mengajukan verifikasi usaha → admin menyetujui.
2. Retailer memposting produk (harga promo, stok, tanggal kedaluwarsa, jam pickup, jadwal diskon bertahap).
3. Customer mencari (kata kunci, kategori, harga, halal, jarak, tutup ≤ 1 jam), lalu memesan → mendapat kode pickup 6 digit.
4. Retailer menandai **siap diambil**, lalu memasukkan kode pickup untuk **menyelesaikan** pesanan.
   Komisi platform dihitung saat pesanan selesai.
5. Customer tidak datang → retailer menandai **no-show** (stok kembali; 3x no-show = akun disuspend).
6. Admin mencatat settlement manual berdasarkan saldo retailer.

Pembayaran saat ini hanya **cash on pickup**. Pembayaran online dan email verifikasi/reset password
belum ada karena membutuhkan kredensial provider.

## Endpoint API

Endpoint fitur ada di `Back end/src/members/<nama>/PBI-xx/backend/`; helper dan alias kompatibilitas
ada di `Back end/src/modules/`.

- Auth: `GET /api/auth/config` · `POST /api/auth/register|login|demo|logout` · `GET /api/auth/me`
- Akun: `GET /api/dashboard` · `GET|PUT|DELETE /api/account` · `PUT /api/account/password`
- Gerai: `GET /api/stores` · `GET|PUT /api/store` · `GET /api/favorites` · `PUT|DELETE /api/favorites/:id` · `GET|POST /api/verification`
- Produk: `GET /api/catalog/products` · `GET /api/retailer/products` · `POST /api/products` · `PATCH|DELETE /api/products/:id` · `GET|PUT /api/filters` · `GET|POST /api/categories` · `PATCH|DELETE /api/categories/:id`
- Pesanan: `GET|POST /api/orders` · `PATCH /api/orders/:id` · `POST /api/orders/:id/no-show`
- Laporan & ulasan: `GET|POST /api/reports` · `GET|POST /api/retailer/reports` · `GET|POST /api/reviews` · `PATCH|DELETE /api/reviews/:id`
- Lainnya: `GET /api/notifications` · `GET /api/announcements` · `GET|POST /api/templates` · `GET /api/articles`
- Admin (`/api/admin/...`): `summary` · `users` · `admins` · `reports` · `articles` · `verifications` · `commission` · `balances` · `settlements` · `announcements` · `export.csv`

## Catatan teknis

- **Penyimpanan:** tiap koleksi adalah satu tabel MySQL (`row_no`, `id`, `data` JSON); data dimuat ke memori saat start
  dan setiap penulisan mengganti isi tabel dalam satu transaksi. Cocok untuk skala tugas/demo; untuk produksi
  sebaiknya diganti skema relasional. Format tabel sengaja tidak diubah agar dump `tubes_ppl.sql` lama tetap bisa dipakai.
- **Harga bertahap** dihitung saat dibaca (tidak lagi mengubah harga dasar produk). Retailer melihat harga dasar +
  `currentPrice`; customer melihat harga yang berlaku sekarang.
- **Keamanan:** password di-hash scrypt, token sesi disimpan sebagai hash, login dibatasi 10 percobaan gagal/15 menit,
  seluruh data pengguna di-escape sebelum masuk HTML.
