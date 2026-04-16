import { NextRequest } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and, gt, or, isNull } from "drizzle-orm";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-6117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

/**
 * Validates the API Key from the request headers (x-api-key)
 * Checks if the key exists, is active, and is not expired.
 */
export async function validateApiKey(req: NextRequest) {
  // Support either header OR URL query parameter for easiest browser testing
  const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("x-api-key");

  if (!apiKey) {
    return { isValid: false, message: "Token tidak boleh kosong, masukkan token pada header 'x-api-key' atau sebagai parameter query '?x-api-key='" };
  }

  const now = new Date();

  // Find key that matches, is active, and (no expiration OR not yet expired)
  const keyRecord = await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.key, apiKey),
      eq(apiKeys.isActive, true),
      or(
        isNull(apiKeys.expiresAt),
        gt(apiKeys.expiresAt, now)
      )
    ),
  });

  if (!keyRecord) {
    return { isValid: false, message: "Token tidak valid, tidak aktif, atau kadaluarsa" };
  }

  return { isValid: true, key: keyRecord };
}
