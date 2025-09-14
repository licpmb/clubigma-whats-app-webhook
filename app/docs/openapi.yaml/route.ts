import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "docs", "openapi.yaml")
    const fileContent = readFileSync(filePath, "utf8")

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/yaml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("[DOCS] Error serving OpenAPI spec:", error)
    return new NextResponse("OpenAPI spec not found", { status: 404 })
  }
}
