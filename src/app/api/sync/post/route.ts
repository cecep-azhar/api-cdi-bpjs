import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { icd10, icd9, tariffs, tindakan, diagnosa, bpjs } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const {
      icd10: icd10Data,
      icd9: icd9Data,
      tariffs: tariffsData,
      tindakan: tindakanData,
      diagnosa: diagnosaData,
      bpjs: bpjsData,
    } = await req.json();

    if (icd10Data && Array.isArray(icd10Data)) {
      for (const item of icd10Data) {
        await db.insert(icd10).values({
          ...item,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: icd10.code,
          set: { ...item, updatedAt: new Date() },
        });
      }
    }

    if (icd9Data && Array.isArray(icd9Data)) {
      for (const item of icd9Data) {
        await db.insert(icd9).values({
          ...item,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: icd9.code,
          set: { ...item, updatedAt: new Date() },
        });
      }
    }

    if (tariffsData && Array.isArray(tariffsData)) {
      for (const item of tariffsData) {
        await db.insert(tariffs).values({
          ...item,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: tariffs.code,
          set: { ...item, updatedAt: new Date() },
        });
      }
    }

    if (tindakanData && Array.isArray(tindakanData)) {
      for (const item of tindakanData) {
        await db.insert(tindakan).values({
          ...item,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: tindakan.kodeCdi,
          set: { ...item, updatedAt: new Date() },
        });
      }
    }

    if (diagnosaData && Array.isArray(diagnosaData)) {
      for (const item of diagnosaData) {
        await db.insert(diagnosa).values({
          ...item,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: diagnosa.kodeCdi,
          set: { ...item, updatedAt: new Date() },
        });
      }
    }

    if (bpjsData && Array.isArray(bpjsData)) {
      for (const item of bpjsData) {
        await db.insert(bpjs).values({
          ...item,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: bpjs.kodeBpjs,
          set: { ...item, updatedAt: new Date() },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        icd10: icd10Data ? icd10Data.length : 0,
        icd9: icd9Data ? icd9Data.length : 0,
        tariffs: tariffsData ? tariffsData.length : 0,
        tindakan: tindakanData ? tindakanData.length : 0,
        diagnosa: diagnosaData ? diagnosaData.length : 0,
        bpjs: bpjsData ? bpjsData.length : 0,
      },
      serverTimestamp: Date.now(),
    });
  } catch (error) {
    console.error("Post sync error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
