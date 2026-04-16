# Database Structure & Relationships

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐
│     icd10       │       │      icd9       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ code (UNIQUE)   │       │ code (UNIQUE)   │
│ nameId          │       │ nameId          │
│ nameEn          │       │ nameEn          │
│ isActive        │       │ isActive        │
│ createdAt       │       │ createdAt       │
│ updatedAt       │       │ updatedAt       │
└────────┬────────┘       └────────┬────────┘
         │                          │
         │ 1:N                      │ 1:N
         ▼                          ▼
┌─────────────────┐       ┌─────────────────┐
│    diagnoses    │       │   procedures    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ cdiCode (UNIQUE)│       │ cdiCode (UNIQUE)│
│ name            │       │ name            │
│ description     │       │ description     │
│ icd10Id (FK) ───┼───────┤ icd9Id (FK)     │
│ isActive        │       │ isActive        │
│ createdAt       │       │ createdAt       │
│ updatedAt       │       │ updatedAt       │
└────────┬────────┘       └────────┬────────┘
         │                          │
         │ 1:N                       │ 1:N
         ▼                          ▼
┌─────────────────────────────────────────────────┐
│                  bpjsMappings                  │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ bpjsCode (UNIQUE)                              │
│ procedureId (FK) ──────────────────────────────►│
│ diagnosisId (FK) ─────────────────────────────►│
│ baseTariff                                      │
│ isActive                                        │
│ createdAt                                       │
│ updatedAt                                       │
└─────────────────────────────────────────────────┘

┌─────────────────┐
│    api_keys     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ key (UNIQUE)    │
│ expiresAt       │
│ isActive        │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│    tariffs      │
├─────────────────┤
│ id (PK)         │
│ code (UNIQUE)   │
│ name            │
│ category        │
│ class           │
│ tariff          │
│ isActive        │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│   sync_logs     │
├─────────────────┤
│ id (PK)         │
│ entity          │
│ lastSync        │
│ status          │
└─────────────────┘
```

---

## Table Definitions

### 1. icd10
International Classification of Diseases version 10.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| code | TEXT | NOT NULL, UNIQUE | ICD-10 code (e.g., "A00", "J18.9") |
| nameId | TEXT | NOT NULL | Disease name in Indonesian |
| nameEn | TEXT | NULLABLE | Disease name in English |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `code` (UNIQUE)

---

### 2. icd9
International Classification of Diseases version 9 (Procedures).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| code | TEXT | NOT NULL, UNIQUE | ICD-9 procedure code (e.g., "001.0") |
| nameId | TEXT | NOT NULL | Procedure name in Indonesian |
| nameEn | TEXT | NULLABLE | Procedure name in English |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `code` (UNIQUE)

---

### 3. procedures (Tindakan)
CDI medical procedures master data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| cdiCode | TEXT | NOT NULL, UNIQUE | CDI internal code (e.g., "T001") |
| name | TEXT | NOT NULL | Procedure name |
| description | TEXT | NULLABLE | Detailed description |
| icd9Id | INTEGER | FOREIGN KEY (icd9.id) | Reference to ICD-9 |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `cdiCode` (UNIQUE)
**Foreign Keys:** `icd9Id` → `icd9(id)`

---

### 4. diagnoses (Diagnosa)
CDI medical diagnoses master data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| cdiCode | TEXT | NOT NULL, UNIQUE | CDI internal code (e.g., "D001") |
| name | TEXT | NOT NULL | Diagnosis name |
| description | TEXT | NULLABLE | Detailed description |
| icd10Id | INTEGER | FOREIGN KEY (icd10.id) | Reference to ICD-10 |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `cdiCode` (UNIQUE)
**Foreign Keys:** `icd10Id` → `icd10(id)`

---

### 5. bpjsMappings
Mapping between BPJS codes and CDI procedures/diagnoses with tariffs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| bpjsCode | TEXT | NOT NULL, UNIQUE | BPJS tariff code (e.g., "B001") |
| procedureId | INTEGER | FOREIGN KEY (procedures.id), NULLABLE | Reference to procedure |
| diagnosisId | INTEGER | FOREIGN KEY (diagnoses.id), NULLABLE | Reference to diagnosis |
| baseTariff | REAL | NOT NULL, DEFAULT 0 | Base tariff amount in IDR |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `bpjsCode` (UNIQUE)
**Foreign Keys:**
- `procedureId` → `procedures(id)`
- `diagnosisId` → `diagnoses(id)`

**Note:** Either `procedureId` OR `diagnosisId` should be set (or both).

---

### 6. tariffs
Medical service tariff rates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| code | TEXT | NOT NULL, UNIQUE | Tariff code |
| name | TEXT | NOT NULL | Tariff name |
| category | TEXT | NULLABLE | Category classification |
| class | TEXT | NULLABLE | Class/grade |
| tariff | REAL | NOT NULL, DEFAULT 0 | Tariff amount in IDR |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `code` (UNIQUE)

---

### 7. api_keys
API authentication keys for desktop client access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Client/Application name |
| key | TEXT | NOT NULL, UNIQUE | API key (prefix: "cdi_") |
| expiresAt | TIMESTAMP | NULLABLE | Expiration date (null = never) |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT strftime('%s', 'now') | Last update timestamp |

**Indexes:** `key` (UNIQUE)

---

### 8. sync_logs
Audit trail for data synchronization events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| entity | TEXT | NOT NULL | Entity name (icd10, icd9, etc.) |
| lastSync | TIMESTAMP | NOT NULL | Last synchronization timestamp |
| status | TEXT | NOT NULL | Status (success, failed, etc.) |

---

## Relationships Summary

| Parent Table | Child Table | Relationship | FK Column |
|-------------|-------------|---------------|-----------|
| icd9 | procedures | 1:N | icd9Id |
| icd10 | diagnoses | 1:N | icd10Id |
| procedures | bpjsMappings | 1:N | procedureId |
| diagnoses | bpjsMappings | 1:N | diagnosisId |

---

## Data Flow

### Creating a BPJS Mapping
```
1. Admin creates Procedure with ICD-9 reference
   → procedures.icd9Id → icd9.id

2. Admin creates Diagnosis with ICD-10 reference
   → diagnoses.icd10Id → icd10.id

3. Admin creates BPJS Mapping
   → bpjsMappings.procedureId → procedures.id
   → bpjsMappings.diagnosisId → diagnoses.id
```

### Sync Process
```
Desktop Client                    API Server                    Database
     │                               │                            │
     │──── GET /api/sync/get ───────>│                            │
     │                               │──── Query changes ───────>│
     │                               │<─── Return changes ───────│
     │<─── JSON data ────────────────│                            │
     │                               │                            │
     │──── POST /api/sync/post ─────>│                            │
     │                               │──── Upsert data ─────────>│
     │                               │<─── Confirm ──────────────│
     │<─── Success ──────────────────│                            │
```

---

## Key Constraints

1. **Unique Codes**: All master tables (icd10, icd9, procedures, diagnoses, tariffs, bpjsMappings) have unique code fields
2. **Active/Inactive Pattern**: All data tables support soft-delete via `isActive` boolean
3. **Timestamp Tracking**: All tables have `createdAt` and `updatedAt` for audit purposes
4. **Cascading Relationships**: Foreign key constraints ensure referential integrity
5. **Soft Delete Recommendation**: When data is referenced by bpjsMappings, set `isActive=false` instead of deleting

---

## Version
- Created: 2026-04-16
- Author: Cecep Saeful Azhar Hidayat, ST
- WhatsApp: 0852-2069-9117
- Email: cecepazhar126@gmail.com