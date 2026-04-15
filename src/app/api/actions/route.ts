import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateApiKey } from "@/lib/api-auth";

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
    const data = await db.select().from(actions).orderBy(actions.cdiCode);
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
        isActive: item.isActive ?? true,
      }));

      for (const val of values) {
        await db.insert(actions).values(val).onConflictDoUpdate({
          target: actions.cdiCode,
          set: { name: val.name, description: val.description, isActive: val.isActive, updatedAt: new Date() },
        });
      }
      return NextResponse.json({ success: true, message: `${values.length} data imported successfully` });
    } else {
      await db.insert(actions).values({
        cdiCode: body.cdiCode,
        name: body.name,
        description: body.description,
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
    await db.update(actions)
      .set({ cdiCode: body.cdiCode, name: body.name, description: body.description, isActive: body.isActive, updatedAt: new Date() })
      .where(eq(actions.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to update data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.delete(actions).where(eq(actions.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to delete data" }, { status: 500 });
  }
}
