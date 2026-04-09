import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Check if the request is from an authenticated admin.
 */
async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token === process.env.ADMIN_SECRET;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await db.query.apiKeys.findMany({
      orderBy: [desc(apiKeys.createdAt)],
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Fetch API Keys error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, expirationYears } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    // Generate a secure random string for the API key
    const rawKey = crypto.randomBytes(32).toString("hex");
    const key = `cdi_${rawKey}`;
    
    let expiresAt = null;
    if (expirationYears && expirationYears !== "forever") {
      const years = parseInt(expirationYears);
      if (!isNaN(years)) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + years);
        expiresAt = date;
      }
    }

    await db.insert(apiKeys).values({
      name,
      key,
      expiresAt,
      isActive: true,
    });

    return NextResponse.json({ 
      success: true, 
      message: "API Key generated successfully",
      key // Return the key only once upon creation
    });
  } catch (error) {
    console.error("Create API Key error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return NextResponse.json({ success: true, message: "API Key deleted" });
  } catch (error) {
    console.error("Delete API Key error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
