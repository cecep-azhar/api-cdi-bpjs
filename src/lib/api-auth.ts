import { NextRequest } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and, gt, or, isNull } from "drizzle-orm";

/**
 * Validates the API Key from the request headers (x-api-key)
 * Checks if the key exists, is active, and is not expired.
 */
export async function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  
  if (!apiKey) {
    return { isValid: false, message: "API Key is missing (use x-api-key header)" };
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
    return { isValid: false, message: "Invalid, inactive, or expired API Key" };
  }

  return { isValid: true, key: keyRecord };
}
