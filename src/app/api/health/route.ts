import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for the API Hub
 * Checks server uptime and database connectivity.
 */
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
