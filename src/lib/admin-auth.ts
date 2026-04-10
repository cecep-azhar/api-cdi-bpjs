import { NextRequest } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "supersecrettoken";

/**
 * Validates the admin session cookie.
 * Used for internal admin-only API routes.
 */
export function validateAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return token === ADMIN_SECRET;
}
