import { NextRequest } from "next/server";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-9117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET || "supersecrettoken";

/**
 * Validates the admin session cookie.
 * Used for internal admin-only API routes.
 */
export function validateAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return token === ADMIN_SECRET;
}
