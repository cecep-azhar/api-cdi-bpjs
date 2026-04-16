import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { procedures, syncLogs, bpjsMappings } from "@/db/schema";
import { eq, or, like, sql } from "drizzle-orm";
import { validateApiKey } from "@/lib/api-auth";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-6117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

function validateCdiCode(code: string, prefix: string = "P"): { valid: boolean; message?: string } {
  // CDI Code format: prefix followed by 1-5 chars (uppercase letters, numbers, dashes)
  const cdiRegex = new RegExp(`^[A-Z0-9-]{1,10}$`, "i");
  if (!code || code.trim() === "") {
    return { valid: false, message: "Kode tidak boleh kosong" };
  }
  if (!code.toUpperCase().startsWith(prefix) && !code.toUpperCase().startsWith(prefix + "-")) {
    return { valid: false, message: `Kode harus diawali dengan "${prefix}" atau "${prefix}-"` };
  }
  if (!cdiRegex.test(code.trim())) {
    return { valid: false, message: "Format kode tidak valid. Gunakan huruf, angka, dan tanda hubung" };
  }
  return { valid: true };
}

function isInternalAdminRequest(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("x-api-key");
  return !apiKey;
}

async function logAudit(entity: string, action: string, details: string, status: string) {
  try {
    await db.insert(syncLogs).values({ entity, lastSync: new Date(), status: `${action}: ${status}` });
  } catch (err) { console.error("Audit log error:", err); }
}

export async function GET(req: NextRequest) {
  if (!isInternalAdminRequest(req)) {
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, message: auth.message || "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      whereClause = or(
        like(procedures.cdiCode, `%${search}%`),
        like(procedures.name, `%${search}%`)
      );
    }

    const [data, countResult] = await Promise.all([
      db.select().from(procedures).where(whereClause).orderBy(procedures.cdiCode).limit(limit).offset(offset),
      db.select({ count: sql`count(*) as count` }).from(procedures).where(whereClause)
    ]);

    const total = Number(countResult[0]?.count) || 0;
    return NextResponse.json({
      success: true, data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page < Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      if (body.length === 0) return NextResponse.json({ success: true, message: "No data", errors: [] });

      const results: { row: number; code: string; status: "success" | "error"; message?: string }[] = [];
      let successCount = 0; let errorCount = 0;

      for (let i = 0; i < body.length; i++) {
        const item = body[i];
        const rowNum = i + 2;

        const validation = validateCdiCode(item.cdiCode, "P");
        if (!validation.valid) {
          results.push({ row: rowNum, code: item.cdiCode || "", status: "error", message: validation.message });
          errorCount++; continue;
        }

        if (!item.name || item.name.trim() === "") {
          results.push({ row: rowNum, code: item.cdiCode, status: "error", message: "Nama harus diisi" });
          errorCount++; continue;
        }

        try {
          await db.insert(procedures).values({
            cdiCode: item.cdiCode.trim().toUpperCase(),
            name: item.name.trim(),
            description: item.description?.trim() || null,
            icd9Id: item.icd9Id || null,
            isActive: item.isActive ?? true,
          }).onConflictDoUpdate({
            target: procedures.cdiCode,
            set: { name: item.name.trim(), description: item.description?.trim() || null, icd9Id: item.icd9Id || null, isActive: item.isActive ?? true, updatedAt: new Date() },
          });
          results.push({ row: rowNum, code: item.cdiCode, status: "success" });
          successCount++;
        } catch (err: any) {
          results.push({ row: rowNum, code: item.cdiCode, status: "error", message: err.message || "Database error" });
          errorCount++;
        }
      }

      await logAudit("procedures", "BULK_IMPORT", `Imported ${successCount} items, ${errorCount} errors`, errorCount > 0 ? "partial" : "success");

      return NextResponse.json({
        success: errorCount === 0,
        message: `Imported ${successCount} of ${body.length} items successfully`,
        summary: { total: body.length, success: successCount, errors: errorCount },
        errors: results.filter(r => r.status === "error")
      });
    } else {
      const { cdiCode, name, description, icd9Id, isActive = true } = body;

      if (!cdiCode || !name) {
        return NextResponse.json({ success: false, message: "Code and Name are required" }, { status: 400 });
      }

      const validation = validateCdiCode(cdiCode, "P");
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
      }

      await db.insert(procedures).values({
        cdiCode: cdiCode.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        icd9Id: icd9Id || null,
        isActive,
      }).onConflictDoUpdate({
        target: procedures.cdiCode,
        set: { name: name.trim(), description: description?.trim() || null, icd9Id: icd9Id || null, isActive, updatedAt: new Date() },
      });

      await logAudit("procedures", "CREATE_UPDATE", `Code: ${cdiCode}`, "success");

      return NextResponse.json({ success: true, message: "Data added/updated" });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || "Failed to save data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, cdiCode, name, description, icd9Id, isActive } = await req.json();

    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    if (cdiCode) {
      const validation = validateCdiCode(cdiCode, "P");
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
      }
    }

    if (!name) return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });

    await db.update(procedures).set({
      cdiCode: cdiCode?.trim().toUpperCase(),
      name: name.trim(),
      description: description?.trim() || null,
      icd9Id: icd9Id || null,
      isActive,
      updatedAt: new Date()
    }).where(eq(procedures.id, id));

    await logAudit("procedures", "UPDATE", `ID: ${id}`, "success");

    return NextResponse.json({ success: true, message: "Data updated" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || "Failed to update data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const existingBpjs = await db.query.bpjsMappings.findFirst({
      where: eq(bpjsMappings.procedureId, id)
    });

    if (existingBpjs) {
      return NextResponse.json({
        success: false,
        message: "Tidak dapat dihapus: Procedure ini sedang digunakan di BPJS Mappings. Silakan nonaktifkan saja."
      }, { status: 400 });
    }

    await db.delete(procedures).where(eq(procedures.id, id));
    await logAudit("procedures", "DELETE", `ID: ${id}`, "success");

    return NextResponse.json({ success: true, message: "Data deleted" });
  } catch (err: any) {
    console.error(err);
    const msg = err.message || "";
    if (msg.toLowerCase().includes("constraint") || msg.toLowerCase().includes("foreign key")) {
      return NextResponse.json({
        success: false,
        message: "Tidak dapat dihapus: Data ini sedang digunakan di Master BPJS Mappings. Silakan nonaktifkan saja."
      }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to delete data" }, { status: 500 });
  }
}