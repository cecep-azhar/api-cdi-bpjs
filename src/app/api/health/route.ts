import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-6117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

export const dynamic = "force-dynamic";
export async function GET() {
  const start = Date.now();
  let dbStatus = "offline";

  try {
    // Simple raw query to check connection
    await db.run(sql`SELECT 1`);
    dbStatus = "online";
  } catch (error) {
    console.error("Health check DB error:", error);
  }

  const latency = Date.now() - start;

  return NextResponse.json({
    status: dbStatus === "online" ? "online" : "degraded",
    components: {
      api_server: "online",
      database: dbStatus,
      sync_engine: "online",
    },
    metrics: {
      latency: `${latency}ms`,
      uptime: Math.floor(process.uptime()), // Seconds
    },
    timestamp: new Date().toISOString(),
  });
}
