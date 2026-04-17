import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd10, icd9, tariffs, procedures, diagnoses, bpjsMappings } from "@/db/schema";
import { gt } from "drizzle-orm";
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

export async function GET(req: NextRequest) {
  try {
    // Validate API Key
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const lastSync = searchParams.get("last_sync");
    const timestamp = lastSync ? new Date(parseInt(lastSync)) : new Date(0);
    const types = searchParams.get("type")?.split(",").map(t => t.trim()) || [];

    const shouldFetch = (type: string) => types.length === 0 || types.includes(type);

    const data: any = {};

    if (shouldFetch("icd10")) {
      data.icd10 = await db.query.icd10.findMany({
        where: gt(icd10.updatedAt, timestamp),
      });
    }

    if (shouldFetch("icd9")) {
      data.icd9 = await db.query.icd9.findMany({
        where: gt(icd9.updatedAt, timestamp),
      });
    }

    if (shouldFetch("tariffs")) {
      data.tariffs = await db.query.tariffs.findMany({
        where: gt(tariffs.updatedAt, timestamp),
      });
    }

    if (shouldFetch("procedures")) {
      data.procedures = await db.query.procedures.findMany({
        where: gt(procedures.updatedAt, timestamp),
      });
    }

    if (shouldFetch("diagnoses")) {
      data.diagnoses = await db.query.diagnoses.findMany({
        where: gt(diagnoses.updatedAt, timestamp),
      });
    }

    if (shouldFetch("bpjs") || shouldFetch("bpjsMappings")) {
      data.bpjsMappings = await db.query.bpjsMappings.findMany({
        where: gt(bpjsMappings.updatedAt, timestamp),
      });
    }

    return NextResponse.json({
      success: true,
      data,
      serverTimestamp: Date.now(),
    });
  } catch (error) {
    console.error("Fetch sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
