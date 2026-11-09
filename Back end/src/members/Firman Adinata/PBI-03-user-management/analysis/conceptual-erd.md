# PBI-03 — Skema Konseptual Manajemen Pengguna

```mermaid
erDiagram
  USER ||--o{ SESSION : owns
  USER ||--o{ ORDER : customer
  USER ||--o{ ORDER : retailer
  USER ||--o{ NOTIFICATION : receives
  USER {
    string id PK
    string name
    string email UK
    string role
    boolean suspended
    int noShowCount
  }
  SESSION {
    string id PK
    string userId FK
    string tokenHash
    datetime expiresAt
  }
  ORDER {
    string id PK
    string customerId FK
    string storeId FK
    string status
  }
  NOTIFICATION {
    string id PK
    string userId FK
    boolean read
  }
```

`store`, `verification`, `favorites`, dan credential hash saat ini menjadi atribut akun yang
tertanam pada dokumen `USER`. Diagram ini model konseptual; aplikasi sekarang menyimpan tiap koleksi
sebagai JSON di tabel MySQL generik (`row_no`, `id`, `data`), bukan tabel relasional dengan foreign
key. Jika migrasi relasional dilakukan, `USER.id` menjadi acuan bagi `SESSION.userId`,
`ORDER.customerId`, `ORDER.storeId`, dan `NOTIFICATION.userId`.
