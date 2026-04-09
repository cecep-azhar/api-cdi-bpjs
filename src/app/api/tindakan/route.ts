import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tindakan } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.insert(tindakan).values({
      kodeCdi: body.kodeCdi,
      name: body.name,
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
    await db.update(tindakan)
      .set({ kodeCdi: body.kodeCdi, name: body.name, isActive: body.isActive, updatedAt: new Date() })
      .where(eq(tindakan.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.delete(tindakan).where(eq(tindakan.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal menghapus data" }, { status: 500 });
  }
}
