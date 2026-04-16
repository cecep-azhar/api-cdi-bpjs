# Business Requirements Document (BRD)
## api-cdi-bpjs - Medical CDI Sync Hub

---

## 1. Project Overview

**Project Name:** `api-cdi-bpjs` (Medical CDI Sync Hub)

**Project Type:** Next.js-based REST API and Admin Dashboard

**Core Purpose:** A robust, offline-first synchronization engine for ICD-9, ICD-10, and BPJS Tariffs that enables seamless data parity between desktop clients and the cloud. It manages medical master data synchronization for Indonesian healthcare/BPJS (Badan Penyelenggara Jaminan Sosial) medical coding systems.

---

## 2. Overall Architecture

The project follows a **Next.js App Router architecture** with:

| Layer | Technology | Description |
|-------|------------|-------------|
| Frontend | React 19.2.4 | Admin dashboard with status page and login |
| Backend | Next.js 16.2.2 | App Router API Routes providing RESTful endpoints |
| Database | SQLite via Turso | libsql client with Drizzle ORM |
| Auth (Admin) | Cookie-based session | `admin_token` cookie |
| Auth (API) | API Key | `x-api-key` header |

**Directory Structure:**
```
src/
├── app/
│   ├── api/               # REST API endpoints
│   │   ├── auth/          # Admin authentication
│   │   ├── api-keys/      # API key management
│   │   ├── bpjs/          # BPJS mappings CRUD
│   │   ├── diagnoses/     # Medical diagnoses CRUD
│   │   ├── health/        # Health check endpoint
│   │   ├── icd10/         # ICD-10 codes CRUD
│   │   ├── icd9/          # ICD-9 codes CRUD
│   │   ├── procedures/    # Medical procedures CRUD
│   │   └── sync/          # Data synchronization
│   ├── admin/             # Admin dashboard pages
│   ├── login/             # Login page
│   └── status/            # System status page
├── db/                    # Database layer
│   ├── schema.ts          # Drizzle ORM schema definitions
│   └── index.ts           # Database connection
└── lib/                   # Shared libraries
    ├── api-auth.ts        # API key validation
    └── admin-auth.ts      # Admin session validation
```

---

## 3. Database Schema (8 Tables)

| Table | Purpose | Foreign Keys |
|-------|---------|--------------|
| `icd10` | International Classification of Diseases v10 | None |
| `icd9` | International Classification of Diseases v9 | None |
| `tariffs` | Medical service tariff rates | None |
| `procedures` (tindakan) | CDI medical procedures | `icd9_id` |
| `diagnoses` (diagnosa) | CDI medical diagnoses | `icd10_id` |
| `bpjs_mappings` | Core mapping table (BPJS codes to procedures/diagnoses) | `procedure_id`, `diagnosis_id` |
| `api_keys` | API authentication keys | None |
| `sync_logs` | Audit trail for data synchronization | None |

---

## 4. API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | POST, DELETE | Admin login/logout |
| `/api/api-keys` | GET, POST, DELETE | API key management |
| `/api/bpjs` | GET, POST, PUT, DELETE | BPJS code mappings |
| `/api/diagnoses` | GET, POST, PUT, DELETE | Medical diagnoses |
| `/api/icd10` | GET, POST, PUT, DELETE | ICD-10 codes |
| `/api/icd9` | GET, POST, PUT, DELETE | ICD-9 codes |
| `/api/procedures` | GET, POST, PUT, DELETE | Medical procedures |
| `/api/sync/get` | POST | Fetch data changes since timestamp |
| `/api/sync/post` | POST | Bulk sync data to server |
| `/api/health` | GET | Health check for API Hub |

---

## 5. Admin Dashboard Pages

| Page | Path | Functionality |
|------|------|---------------|
| Dashboard | `/admin` | Overview with statistics for all master data |
| Procedures | `/admin/procedures` | Manage medical procedures with ICD-9 mapping |
| Diagnoses | `/admin/diagnoses` | Manage medical diagnoses with ICD-10 mapping |
| BPJS | `/admin/bpjs` | Map BPJS codes to procedures/diagnoses with tariffs |
| ICD-10 | `/admin/icd10` | International diagnosis codes v10 |
| ICD-9 | `/admin/icd9` | International diagnosis codes v9 |
| API Keys | `/admin/api-keys` | Generate and manage API access keys |

---

## 6. Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.2.2 |
| UI Library | React | 19.2.4 |
| Database | SQLite (Turso) | - |
| ORM | Drizzle ORM | 0.30.10 |
| Database Client | libsql (Turso) | 0.6.0 |
| Language | TypeScript | 5 |
| Icons | Lucide React | 1.8.0 |
| Testing | Playwright | 1.59.1 |

**Environment Variables (.env):**
```
DATABASE_URL=file:local.db
ADMIN_USER=admin
ADMIN_PASS=admin123
ADMIN_SECRET=supersecrettoken-cdi-bpjs-2024
```

---

## 7. Key Features

### 7.1 API Key Authentication
- API keys validated via `x-api-key` header or URL query parameter
- Optional expiration dates on keys
- Secure random key generation using `crypto.randomBytes`
- Only active, non-expired keys are valid

### 7.2 Admin Authentication
- Cookie-based session with `admin_token`
- Login via form POST to `/api/auth`
- Protected routes via middleware proxy (`src/proxy.ts`)

### 7.3 Data Synchronization
- **POST `/api/sync/post`**: Bulk import data for all entity types with upsert logic (`ON CONFLICT DO UPDATE`)
- **GET `/api/sync/get`**: Fetch all data modified after a given timestamp for incremental sync

### 7.4 CRUD Operations
All main entities support:
- **GET**: List all records (ordered by code)
- **POST**: Create single or bulk insert with upsert
- **PUT**: Update existing record by ID
- **DELETE**: Remove record by ID

### 7.5 Admin Dashboard Features
- Real-time statistics and counts
- Search/filter functionality
- CSV import/export for BPJS mappings
- Modal forms for add/edit operations
- Visual badges for active/inactive status
- Indonesian locale formatting for currency

### 7.6 Health Monitoring
- `/api/health` endpoint checks database connectivity
- `/status` page displays uptime, latency, and component status
- Visual heartbeat grid showing 24-hour uptime history

### 7.7 Security
- Internal admin requests bypass API key requirement
- External requests require valid `x-api-key`
- HTTP-only cookies for admin sessions
- Input validation on all API endpoints

---

## 8. Data Flow

### 8.1 Creating a BPJS Mapping
1. Admin logs in via `/login`
2. Navigates to `/admin/bpjs`
3. Clicks "Add Mapping" button
4. Fills form: BPJS code, selects procedure, selects diagnosis, sets tariff
5. Form POSTs to `/api/bpjs`
6. API validates session, inserts/updates record
7. Frontend refreshes data and closes modal

### 8.2 Client Sync Flow
1. Desktop client sends POST to `/api/sync/post` with API key
2. Server validates key, processes bulk data with upsert logic
3. Returns success count and timestamp
4. Client stores timestamp for next incremental sync

---

## 9. Summary

**api-cdi-bpjs** is a medical data management API with an admin dashboard for Indonesian healthcare/BPJS coding. It enables centralized master data management (ICD-10, ICD-9, procedures, diagnoses, tariffs, and BPJS mappings) with secure API access for desktop client synchronization.

The architecture is clean with proper separation between database, API, and UI layers.