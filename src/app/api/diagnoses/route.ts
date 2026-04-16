import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { diagnoses } from "@/db/schema";
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
    const data = await db.select().from(diagnoses).orderBy(diagnoses.cdiCode);
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
        cdiCode: item.cdiCode,
        name: item.name,
        description: item.description,
        icd10Id: item.icd10Id || null,
        isActive: item.isActive ?? true,
      }));

      for (const val of values) {
        await db.insert(diagnoses).values(val).onConflictDoUpdate({
          target: diagnoses.cdiCode,
          set: { name: val.name, description: val.description, icd10Id: val.icd10Id, isActive: val.isActive, updatedAt: new Date() },
        });
      }
      return NextResponse.json({ success: true, message: `${values.length} data imported successfully` });
    } else {
      await db.insert(diagnoses).values({
        cdiCode: body.cdiCode,
        name: body.name,
        description: body.description,
        icd10Id: body.icd10Id || null,
        isActive: body.isActive ?? true,
      });
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to save data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await db.update(diagnoses)
      .set({ cdiCode: body.cdiCode, name: body.name, description: body.description, icd10Id: body.icd10Id || null, isActive: body.isActive, updatedAt: new Date() })
      .where(eq(diagnoses.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to update data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.delete(diagnoses).where(eq(diagnoses.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    const msg = err.message || "";
    if (msg.toLowerCase().includes("constraint") || msg.toLowerCase().includes("foreign key")) {
      return NextResponse.json({ success: false, message: "Gagal: Data diagnosa ini sudah terhubung dan sedang digunakan di Master BPJS Mappings. Silakan nonaktifkan (Inactive) saja." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to delete data" }, { status: 500 });
  }
}
