import { createHmac, timingSafeEqual } from "crypto"

/**
 * Verifies the webhook signature using HMAC-SHA256
 * @param signature The signature from the x-hub-signature-256 header
 * @param rawBody The raw request body as string
 * @param secret The app secret from environment variables
 * @returns boolean indicating if the signature is valid
 */
export function verifyWebhookSignature(signature: string, rawBody: string, secret: string): boolean {
  try {
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.startsWith("sha256=") ? signature.slice(7) : signature

    // Calculate expected signature
    const expectedSignature = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")

    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(Buffer.from(cleanSignature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch (error) {
    console.error("[SECURITY] Error verifying signature:", error)
    return false
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a First string to compare
 * @param b Second string to compare
 * @returns boolean indicating if strings are equal
 */
export function timingSafeStringCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  try {
    const bufferA = Buffer.from(a, "utf8")
    const bufferB = Buffer.from(b, "utf8")

    return timingSafeEqual(bufferA, bufferB)
  } catch (error) {
    console.error("[SECURITY] Error in timing-safe comparison:", error)
    return false
  }
}

/**
 * Validates environment variables required for webhook operation
 * @returns object with validation results
 */
export function validateEnvironmentVariables() {
  const verifyToken = process.env.VERIFY_TOKEN
  const appSecret = process.env.APP_SECRET

  const errors: string[] = []

  if (!verifyToken) {
    errors.push("VERIFY_TOKEN environment variable is required")
  }

  if (!appSecret) {
    errors.push("APP_SECRET environment variable is required")
  }

  if (appSecret && appSecret.length < 16) {
    errors.push("APP_SECRET should be at least 16 characters long")
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      hasVerifyToken: !!verifyToken,
      hasAppSecret: !!appSecret,
      appSecretLength: appSecret?.length || 0,
    },
  }
}
