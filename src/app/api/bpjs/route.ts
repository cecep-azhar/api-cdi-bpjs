import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bpjs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.insert(bpjs).values({
      kodeBpjs: body.kodeBpjs,
      tindakanId: body.tindakanId || null,
      diagnosaId: body.diagnosaId || null,
      tariff: body.tariff ?? 0,
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await db.update(bpjs)
      .set({
        kodeBpjs: body.kodeBpjs,
        tindakanId: body.tindakanId || null,
        diagnosaId: body.diagnosaId || null,
        tariff: body.tariff ?? 0,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(bpjs.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.delete(bpjs).where(eq(bpjs.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal menghapus data" }, { status: 500 });
  }
}
