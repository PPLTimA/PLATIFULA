# PBI-20 — Skema Konseptual No-Show

```mermaid
erDiagram
  USER ||--o{ ORDER : customer
  USER ||--o{ ORDER : retailer
  PRODUCT ||--o{ ORDER : reserved_for
  USER {
    string id PK
    string role
    int noShowCount
    boolean suspended
  }
  ORDER {
    string id PK
    string customerId FK
    string storeId FK
    string productId FK
    int quantity
    string status
  }
  PRODUCT {
    string id PK
    int quantity
  }
```

No-show tidak menjadi entitas terpisah: event dicatat dengan mengubah `ORDER.status` menjadi
`No-show` dan menambah `USER.noShowCount`. Tabel tetap berbentuk koleksi JSON, sehingga relasi pada
diagram adalah konseptual dan tidak diberlakukan sebagai foreign key fisik.
