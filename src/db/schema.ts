import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-6117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

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

// Tabel "procedures" (sebelumnya tindakan)
export const procedures = sqliteTable("procedures", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cdiCode: text("cdi_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icd9Id: integer("icd9_id").references(() => icd9.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// Tabel "diagnoses" (sebelumnya diagnosa)
export const diagnoses = sqliteTable("diagnoses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cdiCode: text("cdi_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icd10Id: integer("icd10_id").references(() => icd10.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const bpjsMappings = sqliteTable("bpjs_mappings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bpjsCode: text("bpjs_code").notNull().unique(),
  procedureId: integer("procedure_id").references(() => procedures.id),
  diagnosisId: integer("diagnosis_id").references(() => diagnoses.id),
  baseTariff: real("base_tariff").notNull().default(0),
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
