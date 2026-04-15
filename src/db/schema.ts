import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const icd10 = sqliteTable("icd10", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  nameId: text("name_id").notNull(),
  nameEn: text("name_en"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const icd9 = sqliteTable("icd9", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  nameId: text("name_id").notNull(),
  nameEn: text("name_en"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const tariffs = sqliteTable("tariffs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category"),
  class: text("class"),
  tariff: real("tariff").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const syncLogs = sqliteTable("sync_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entity: text("entity").notNull(),
  lastSync: integer("last_sync", { mode: "timestamp" }).notNull(),
  status: text("status").notNull(),
});

// Tabel "tindakan" (aksi/tindakan medis) — nama SQL tetap "tindakan" sesuai DB yang ada
export const actions = sqliteTable("tindakan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cdiCode: text("kode_cdi").notNull().unique(),
  name: text("name").notNull(),
  description: text("penjelasan"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// Tabel "diagnosa" — nama SQL tetap "diagnosa" sesuai DB yang ada
export const diagnoses = sqliteTable("diagnosa", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cdiCode: text("kode_cdi").notNull().unique(),
  name: text("name").notNull(),
  description: text("penjelasan"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const bpjs = sqliteTable("bpjs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bpjsCode: text("kode_bpjs").notNull().unique(),
  actionId: integer("tindakan_id").references(() => actions.id),
  diagnosisId: integer("diagnosa_id").references(() => diagnoses.id),
  tariff: real("tariff").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
