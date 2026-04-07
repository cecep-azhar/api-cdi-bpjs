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
  class: text("class"), // Kelas 1, 2, 3, VIP, dsb.
  tariff: real("tariff").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const syncLogs = sqliteTable("sync_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entity: text("entity").notNull(), // 'icd10', 'icd9', 'tariffs'
  lastSync: integer("last_sync", { mode: "timestamp" }).notNull(),
  status: text("status").notNull(), // 'success', 'failed'
});
