import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd9, syncLogs, procedures } from "@/db/schema";
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

// Validate ICD-9 code format
function validateIcd9Code(code: string): { valid: boolean; message?: string } {
  // ICD-9 format: 2-4 digits optionally followed by decimal and more digits
  // Examples: 01, 01.1, 01.12, 86.22
  const icd9Regex = /^\d{2,4}(\.\d{1,2})?$/;
  if (!code || code.trim() === "") {
    return { valid: false, message: "Kode tidak boleh kosong" };
  }
  if (!icd9Regex.test(code.trim())) {
    return { valid: false, message: "Format kode ICD-9 tidak valid. Contoh: 01, 01.1, 86.22" };
  }
  return { valid: true };
}

function isInternalAdminRequest(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("x-api-key");
  return !apiKey;
}

async function logAudit(entity: string, action: string, details: string, status: string) {
  try {
    await db.insert(syncLogs).values({
      entity,
      lastSync: new Date(),
      status: `${action}: ${status}`,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
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
        like(icd9.code, `%${search}%`),
        like(icd9.nameId, `%${search}%`),
        like(icd9.nameEn, `%${search}%`)
      );
    }

    const [data, countResult] = await Promise.all([
      db.select().from(icd9)
        .where(whereClause)
        .orderBy(icd9.code)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*) as count` }).from(icd9).where(whereClause)
    ]);

    const total = Number(countResult[0]?.count) || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages }
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
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < body.length; i++) {
        const item = body[i];
        const rowNum = i + 2;

        const validation = validateIcd9Code(item.code);
        if (!validation.valid) {
          results.push({ row: rowNum, code: item.code || "", status: "error", message: validation.message });
          errorCount++;
          continue;
        }

        if (!item.nameId || item.nameId.trim() === "") {
          results.push({ row: rowNum, code: item.code, status: "error", message: "Nama ID (Indonesia) harus diisi" });
          errorCount++;
          continue;
        }

        try {
          await db.insert(icd9).values({
            code: item.code.trim(),
            nameId: item.nameId.trim(),
            nameEn: item.nameEn?.trim() || null,
            isActive: item.isActive ?? true,
          }).onConflictDoUpdate({
            target: icd9.code,
            set: {
              nameId: item.nameId.trim(),
              nameEn: item.nameEn?.trim() || null,
              isActive: item.isActive ?? true,
              updatedAt: new Date(),
            },
          });
          results.push({ row: rowNum, code: item.code, status: "success" });
          successCount++;
        } catch (err: any) {
          results.push({ row: rowNum, code: item.code, status: "error", message: err.message || "Database error" });
          errorCount++;
        }
      }

      await logAudit("icd9", "BULK_IMPORT", `Imported ${successCount} items, ${errorCount} errors`, errorCount > 0 ? "partial" : "success");

      return NextResponse.json({
        success: errorCount === 0,
        message: `Imported ${successCount} of ${body.length} items successfully`,
        summary: { total: body.length, success: successCount, errors: errorCount },
        errors: results.filter(r => r.status === "error")
      });
    } else {
      const { code, nameId, nameEn, isActive = true } = body;

      if (!code || !nameId) {
        return NextResponse.json({ success: false, message: "Code and Name ID are required" }, { status: 400 });
      }

      const validation = validateIcd9Code(code);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
      }

      await db.insert(icd9).values({
        code: code.trim(),
        nameId: nameId.trim(),
        nameEn: nameEn?.trim() || null,
        isActive,
      }).onConflictDoUpdate({
        target: icd9.code,
        set: { nameId: nameId.trim(), nameEn: nameEn?.trim() || null, isActive, updatedAt: new Date() },
      });

      await logAudit("icd9", "CREATE_UPDATE", `Code: ${code}`, "success");

      return NextResponse.json({ success: true, message: "Data added/updated" });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || "Failed to save data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, code, nameId, nameEn, isActive } = await req.json();

    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    if (code) {
      const validation = validateIcd9Code(code);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
      }
    }

    if (!nameId) {
      return NextResponse.json({ success: false, message: "Name ID is required" }, { status: 400 });
    }

    await db.update(icd9).set({
      code: code?.trim(),
      nameId: nameId.trim(),
      nameEn: nameEn?.trim() || null,
      isActive,
      updatedAt: new Date()
    }).where(eq(icd9.id, id));

    await logAudit("icd9", "UPDATE", `ID: ${id}`, "success");

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

    const existing = await db.query.procedures.findFirst({
      where: eq(procedures.icd9Id, id)
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Tidak dapat dihapus: ICD-9 ini sedang digunakan di Procedures. Silakan nonaktifkan saja."
      }, { status: 400 });
    }

    await db.delete(icd9).where(eq(icd9.id, id));
    await logAudit("icd9", "DELETE", `ID: ${id}`, "success");

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