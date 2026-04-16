import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd10 } from "@/db/schema";
import { eq } from "drizzle-orm";
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

// Internal admin requests (from Next.js server itself) don't send x-api-key
function isInternalAdminRequest(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("x-api-key");
  return !apiKey; // If no API key, assume it's an internal admin UI request
}

export async function GET(req: NextRequest) {
  // Allow either internal admin or valid API key
  if (!isInternalAdminRequest(req)) {
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, message: auth.message || "Unauthorized" }, { status: 401 });
    }
  }
  try {
    const data = await db.select().from(icd10).orderBy(icd10.code);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      if (body.length === 0) return NextResponse.json({ success: true, message: "No data" });

      const values = body.map((item: any) => ({
        code: item.code,
        nameId: item.nameId,
        nameEn: item.nameEn,
        isActive: item.isActive ?? true,
      }));

      for (const val of values) {
        await db.insert(icd10).values(val).onConflictDoUpdate({
          target: icd10.code,
          set: { nameId: val.nameId, nameEn: val.nameEn, isActive: val.isActive, updatedAt: new Date() },
        });
      }
      return NextResponse.json({ success: true, message: `${values.length} data imported successfully` });
    } else {
      const { code, nameId, nameEn, isActive = true } = body;
      if (!code || !nameId) {
        return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
      }

      const result = await db.insert(icd10).values({ code, nameId, nameEn, isActive }).onConflictDoUpdate({
        target: icd10.code,
        set: { nameId, nameEn, isActive, updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, message: "Data added/updated", data: { code, nameId, nameEn, isActive } });
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

    const updated = await db
      .update(icd10)
      .set({ code, nameId, nameEn, isActive, updatedAt: new Date() })
      .where(eq(icd10.id, id));

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

    await db.delete(icd10).where(eq(icd10.id, id));
    return NextResponse.json({ success: true, message: "Data deleted" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || "Failed to delete data" }, { status: 500 });
  }
}
