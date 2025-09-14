import { timingSafeEqual } from "crypto"

/**
 * Verifies the webhook signature using HMAC-SHA256
 * @param signature The signature from the x-hub-signature-256 header
 * @param rawBody The raw request body as string
 * @param secret The app secret from environment variables
 * @returns boolean indicating if the signature is valid
 */
export async function verifyWebhookSignature(signature: string, rawBody: string, secret: string): Promise<boolean> {
  try {
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.startsWith("sha256=") ? signature.slice(7) : signature

    // Use Web Crypto API for HMAC-SHA256
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(rawBody)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    const signature_buffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const expectedSignature = Array.from(new Uint8Array(signature_buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(cleanSignature, expectedSignature)
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

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
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
