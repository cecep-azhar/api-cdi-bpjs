import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { diagnosa } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (Array.isArray(body)) {
      if (body.length === 0) return NextResponse.json({ success: true, message: "Tidak ada data" });
      
      const values = body.map((item: any) => ({
        kodeCdi: item.kodeCdi,
        name: item.name,
        isActive: item.isActive ?? true,
      }));

      // Menggunakan upsert (onConflictDoUpdate)
      for(const val of values) {
         await db.insert(diagnosa).values(val).onConflictDoUpdate({
           target: diagnosa.kodeCdi,
           set: { name: val.name, isActive: val.isActive, updatedAt: new Date() }
         });
      }
      return NextResponse.json({ success: true, message: `${values.length} data berhasil diimpor` });
    } else {
      await db.insert(diagnosa).values({
        kodeCdi: body.kodeCdi,
        name: body.name,
        isActive: body.isActive ?? true,
      });
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await db.update(diagnosa)
      .set({ kodeCdi: body.kodeCdi, name: body.name, isActive: body.isActive, updatedAt: new Date() })
      .where(eq(diagnosa.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.delete(diagnosa).where(eq(diagnosa.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Gagal menghapus data" }, { status: 500 });
  }
}
