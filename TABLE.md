# Database Schema Documentation

Dokumentasi struktur tabel yang digunakan dalam aplikasi CDI BPJS.

---

## 1. **ICD-10** (`icd10`)

Tabel untuk menyimpan klasifikasi penyakit internasional versi 10 (International Classification of Diseases).

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `code` | TEXT | NOT NULL, UNIQUE | Kode ICD-10 (contoh: A00) |
| `name_id` | TEXT | NOT NULL | Nama diagnosis dalam bahasa Indonesia |
| `name_en` | TEXT | NULLABLE | Nama diagnosis dalam bahasa Inggris |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:** Tidak ada foreign key
**Kegunaan:** Referensi diagnosis internasional untuk coding medis

---

## 2. **ICD-9** (`icd9`)

Tabel untuk menyimpan klasifikasi penyakit internasional versi 9 (International Classification of Diseases).

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `code` | TEXT | NOT NULL, UNIQUE | Kode ICD-9 (contoh: 001.0) |
| `name_id` | TEXT | NOT NULL | Nama diagnosis dalam bahasa Indonesia |
| `name_en` | TEXT | NULLABLE | Nama diagnosis dalam bahasa Inggris |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:** Tidak ada foreign key
**Kegunaan:** Referensi diagnosis internasional versi lama untuk compatibility

---

## 3. **Tariffs** (`tariffs`)

Tabel untuk menyimpan data daftar tarif layanan medis.

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `code` | TEXT | NOT NULL, UNIQUE | Kode tarif (contoh: TAR-001) |
| `name` | TEXT | NOT NULL | Nama layanan/tindakan |
| `category` | TEXT | NULLABLE | Kategori layanan (contoh: "Perawatan", "Pembedahan") |
| `class` | TEXT | NULLABLE | Kelas layanan (contoh: "A", "B", "C") |
| `tariff` | REAL | NOT NULL, DEFAULT: 0 | Besaran tarif dalam Rupiah |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:** Tidak ada foreign key
**Kegunaan:** Master data untuk semua tarif layanan medis yang tersedia

---

## 4. **Sync Logs** (`sync_logs`)

Tabel untuk mencatat history proses sinkronisasi data.

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `entity` | TEXT | NOT NULL | Nama entitas yang disinkronisasi (contoh: "icd10", "actions") |
| `last_sync` | TIMESTAMP | NOT NULL | Waktu sync terakhir |
| `status` | TEXT | NOT NULL | Status sync ("success", "failed", "pending") |

**Relasi:** Tidak ada foreign key
**Kegunaan:** Audit trail untuk tracking proses sinkronisasi data eksternal

---

## 5. **Actions / Tindakan** (`tindakan`)

Tabel untuk menyimpan daftar tindakan medis CDI (Clinical Coding).

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `kode_cdi` | TEXT | NOT NULL, UNIQUE | Kode CDI tindakan (contoh: "P-CAV") |
| `name` | TEXT | NOT NULL | Nama tindakan medis |
| `penjelasan` | TEXT | NULLABLE | Deskripsi/penjelasan tindakan |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:** Referenced by `bpjs.tindakan_id` (Foreign Key)
**Kegunaan:** Master data tindakan medis yang dapat dipetakan ke BPJS

---

## 6. **Diagnoses / Diagnosa** (`diagnosa`)

Tabel untuk menyimpan daftar diagnosis CDI (Clinical Coding).

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `kode_cdi` | TEXT | NOT NULL, UNIQUE | Kode CDI diagnosis (contoh: "K02.1") |
| `name` | TEXT | NOT NULL | Nama diagnosis |
| `penjelasan` | TEXT | NULLABLE | Deskripsi/penjelasan diagnosis |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:** Referenced by `bpjs.diagnosa_id` (Foreign Key)
**Kegunaan:** Master data diagnosis yang dapat dipetakan ke BPJS

---

## 7. **BPJS** (`bpjs`)

Tabel untuk menyimpan pemetaan kode BPJS ke tindakan dan diagnosis medis dengan tarif.

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `kode_bpjs` | TEXT | NOT NULL, UNIQUE | Kode BPJS (contoh: "BP001") |
| `tindakan_id` | INTEGER | NULLABLE, FK → `tindakan.id` | Referensi ke tabel Actions |
| `diagnosa_id` | INTEGER | NULLABLE, FK → `diagnosa.id` | Referensi ke tabel Diagnoses |
| `tariff` | REAL | NOT NULL, DEFAULT: 0 | Tarif layanan dalam Rupiah |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:**
- ➜ `tindakan_id` references `tindakan.id`
- ➜ `diagnosa_id` references `diagnosa.id`

**Kegunaan:** Core tabel untuk mapping BPJS dengan tindakan, diagnosis, dan tarif

---

## 8. **API Keys** (`api_keys`)

Tabel untuk menyimpan API key yang digunakan untuk autentikasi API.

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | ID unik |
| `name` | TEXT | NOT NULL | Nama/label API key (contoh: "Mobile App") |
| `key` | TEXT | NOT NULL, UNIQUE | String API key yang unik |
| `expires_at` | TIMESTAMP | NULLABLE | Waktu expiry API key |
| `is_active` | BOOLEAN | DEFAULT: true | Status aktif/nonaktif |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | Waktu perubahan terakhir |

**Relasi:** Tidak ada foreign key
**Kegunaan:** Manajemen API key untuk endpoint sync dan data retrieval

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│   tindakan      │
│   (actions)     │
├─────────────────┤
│ id (PK)         │──┐
│ kode_cdi        │  │
│ name            │  │
│ penjelasan      │  │
│ is_active       │  │
│ created_at      │  │
│ updated_at      │  │
└─────────────────┘  │
                     │
                     │ 1:N
                     │
                     ▼
              ┌──────────────┐
              │    bpjs      │
              ├──────────────┤
              │ id (PK)      │
              │ kode_bpjs    │
              │ tindakan_id  │ ──── FK
              │ diagnosa_id  │ ──── FK
              │ tariff       │
              │ is_active    │
              │ created_at   │
              │ updated_at   │
              └──────────────┘
                     ▲
                     │
                     │ 1:N
                     │
┌─────────────────┐  │
│   diagnosa      │──┘
│  (diagnoses)    │
├─────────────────┤
│ id (PK)         │
│ kode_cdi        │
│ name            │
│ penjelasan      │
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

---

## Catatan Teknis

### Field Naming Convention
- **Database columns** menggunakan `snake_case`: `is_active`, `kode_cdi`, `created_at`
- **JavaScript/TypeScript fields** menggunakan `camelCase`: `isActive`, `cdiCode`, `createdAt`

### Timestamps
- Semua tabel memiliki `created_at` dan `updated_at`
- Format: UNIX Timestamp (detik sejak 1970-01-01)
- Default: Generated otomatis saat insert/update

### Boolean Fields
- Disimpan sebagai INTEGER (0 = false, 1 = true)
- Di JavaScript otomatis convert ke boolean

### Unique Constraints
Setiap master data memiliki unique constraint pada kode mereka:
- `icd10.code`
- `icd9.code`
- `tariffs.code`
- `tindakan.kode_cdi`
- `diagnosa.kode_cdi`
- `bpjs.kode_bpjs`
- `api_keys.key`

---

## Summary Tabel

| Tabel | Jumlah FK | Kegunaan |
|-------|-----------|----------|
| icd10 | 0 | Master diagnosis internasional v10 |
| icd9 | 0 | Master diagnosis internasional v9 |
| tariffs | 0 | Master tarif layanan |
| sync_logs | 0 | Audit trail sinkronisasi |
| tindakan | 0 | Master tindakan medis |
| diagnosa | 0 | Master diagnosis medis |
| **bpjs** | 2 | **Core mapping BPJS** |
| api_keys | 0 | Management API key |

**Total Tabel: 8** | **Total FK: 2** (dalam tabel bpjs)
