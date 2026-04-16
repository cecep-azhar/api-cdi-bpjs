import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL
});

async function run() {
  try {
    // 1. Rename tables
    console.log("Renaming tables...");
    await client.execute("ALTER TABLE tindakan RENAME TO procedures");
    await client.execute("ALTER TABLE diagnosa RENAME TO diagnoses");
    await client.execute("ALTER TABLE bpjs RENAME TO bpjs_mappings");

    // 2. Rename columns in diagnoses
    console.log("Updating diagnoses...");
    await client.execute("ALTER TABLE diagnoses RENAME COLUMN kode_cdi TO cdi_code");
    await client.execute("ALTER TABLE diagnoses RENAME COLUMN penjelasan TO description");
    await client.execute("ALTER TABLE diagnoses ADD COLUMN icd10_id INTEGER REFERENCES icd10(id)");

    // 3. Rename columns in procedures
    console.log("Updating procedures...");
    await client.execute("ALTER TABLE procedures RENAME COLUMN kode_cdi TO cdi_code");
    await client.execute("ALTER TABLE procedures RENAME COLUMN penjelasan TO description");
    await client.execute("ALTER TABLE procedures ADD COLUMN icd9_id INTEGER REFERENCES icd9(id)");

    // 4. Rename columns in bpjs_mappings
    console.log("Updating bpjs_mappings...");
    await client.execute("ALTER TABLE bpjs_mappings RENAME COLUMN kode_bpjs TO bpjs_code");
    await client.execute("ALTER TABLE bpjs_mappings RENAME COLUMN tindakan_id TO procedure_id");
    await client.execute("ALTER TABLE bpjs_mappings RENAME COLUMN diagnosa_id TO diagnosis_id");
    await client.execute("ALTER TABLE bpjs_mappings RENAME COLUMN tariff TO base_tariff");
    
    console.log("Migration completed successfully!");
  } catch(e) {
    console.error("Migration error:", e);
  }
}
run();
