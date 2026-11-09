# PBI-04 — Skema Konseptual Kategori Produk

```mermaid
erDiagram
  CATEGORY ||--o{ PRODUCT : classifies
  CATEGORY {
    string id PK
    string name
  }
  PRODUCT {
    string id PK
    string category
    string storeId
    string name
  }
```

Hubungan kategori-produk saat ini bersifat logis: `PRODUCT.category` menyimpan nama kategori,
bukan `categoryId` dengan foreign key. Koleksi `categories` dan `products` tersimpan sebagai JSON
di tabel MySQL generik. Migrasi relasional sebaiknya menambah `PRODUCT.categoryId` dan menetapkan
kebijakan sebelum kategori yang masih dipakai dihapus.
