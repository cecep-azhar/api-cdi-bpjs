import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd10, icd9, tariffs } from "@/db/schema";
import { gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: {
        icd10: icd10Data,
        icd9: icd9Data,
        tariffs: tariffsData,
      },
      serverTimestamp: Date.now(),
    });
  } catch (error) {
    console.error("Fetch sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
