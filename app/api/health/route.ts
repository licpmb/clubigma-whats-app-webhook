import { type NextRequest, NextResponse } from "next/server"
import { validateEnvironmentVariables } from "@/lib/security"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate environment variables
    const envValidation = validateEnvironmentVariables()

    // Basic system information
    const healthData = {
      ok: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      config: {
        hasRequiredEnvVars: envValidation.isValid,
        envValidation: envValidation.config,
      },
      responseTime: Date.now() - startTime,
    }

    // If environment validation fails, still return 200 but indicate issues
    if (!envValidation.isValid) {
      console.warn("[HEALTH] Environment validation issues:", envValidation.errors)
      return NextResponse.json(
        {
          ...healthData,
          ok: false,
          issues: envValidation.errors,
        },
        { status: 200 },
      )
    }

    console.log("[HEALTH] Health check passed")

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("[HEALTH] Health check failed:", error)

    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}

// Also support POST for health checks (some monitoring tools use POST)
export async function POST(request: NextRequest) {
  return GET(request)
}
