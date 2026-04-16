import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd10, icd9, tariffs, procedures, diagnoses, bpjsMappings } from "@/db/schema";
import { gt } from "drizzle-orm";
import { validateApiKey } from "@/lib/api-auth";

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

    const icd10Data = await db.query.icd10.findMany({
      where: gt(icd10.updatedAt, timestamp),
    });

    const icd9Data = await db.query.icd9.findMany({
      where: gt(icd9.updatedAt, timestamp),
    });

    const tariffsData = await db.query.tariffs.findMany({
      where: gt(tariffs.updatedAt, timestamp),
    });

    const tindakanData = await db.query.procedures.findMany({
      where: gt(procedures.updatedAt, timestamp),
    });

    const diagnosaData = await db.query.diagnoses.findMany({
      where: gt(diagnoses.updatedAt, timestamp),
    });

    const bpjsData = await db.query.bpjsMappings.findMany({
      where: gt(bpjsMappings.updatedAt, timestamp),
    });

    return NextResponse.json({
      success: true,
      data: {
        icd10: icd10Data,
        icd9: icd9Data,
        tariffs: tariffsData,
        procedures: tindakanData,
        diagnoses: diagnosaData,
        bpjsMappings: bpjsData,
      },
      serverTimestamp: Date.now(),
    });
  } catch (error) {
    console.error("Fetch sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
