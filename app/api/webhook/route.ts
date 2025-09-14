import { type NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature, timingSafeStringCompare, validateEnvironmentVariables } from "@/lib/security"

// GET handler for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("[WEBHOOK] GET verification request:", {
    mode,
    hasToken: !!token,
    hasChallenge: !!challenge,
    timestamp: new Date().toISOString(),
  })

  // Validate environment variables
  const envValidation = validateEnvironmentVariables()
  if (!envValidation.isValid) {
    console.error("[WEBHOOK] Environment validation failed:", envValidation.errors)
    return new NextResponse("Server configuration error", { status: 500 })
  }

  // Verify the webhook
  if (mode === "subscribe" && token && process.env.VERIFY_TOKEN) {
    const isValidToken = timingSafeStringCompare(token, process.env.VERIFY_TOKEN)

    if (isValidToken && challenge) {
      console.log("[WEBHOOK] Verification successful")
      return new NextResponse(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }
  }

  console.log("[WEBHOOK] Verification failed - invalid mode, token, or challenge")
  return new NextResponse("Forbidden", { status: 403 })
}

// POST handler for webhook events
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate environment variables first
    const envValidation = validateEnvironmentVariables()
    if (!envValidation.isValid) {
      console.error("[WEBHOOK] Environment validation failed:", envValidation.errors)
      return new NextResponse("Server configuration error", { status: 500 })
    }

    // Get the raw body and signature
    const rawBody = await request.text()
    const signature = request.headers.get("x-hub-signature-256")

    console.log("[WEBHOOK] POST request received:", {
      hasSignature: !!signature,
      bodyLength: rawBody.length,
      timestamp: new Date().toISOString(),
    })

    if (!signature) {
      console.log("[WEBHOOK] Missing signature header")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify the signature
    const appSecret = process.env.APP_SECRET!
    const isValidSignature = verifyWebhookSignature(signature, rawBody, appSecret)

    if (!isValidSignature) {
      console.log("[WEBHOOK] Invalid signature")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Parse and process the webhook event
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error("[WEBHOOK] Failed to parse JSON body:", parseError)
      return new NextResponse("Bad Request", { status: 400 })
    }

    // Log the complete event for debugging
    console.log("[WEBHOOK] Event received and verified:", {
      object: body.object,
      entryCount: body.entry?.length || 0,
      processingTime: Date.now() - startTime,
    })

    // Detailed logging of the event structure
    console.log("[WEBHOOK] Full event data:", JSON.stringify(body, null, 2))

    // Process WhatsApp Business events
    if (body.object === "whatsapp_business_account") {
      await processWhatsAppEvent(body)
    } else {
      console.log("[WEBHOOK] Unknown object type:", body.object)
    }

    const processingTime = Date.now() - startTime
    console.log(`[WEBHOOK] Event processed successfully in ${processingTime}ms`)

    return new NextResponse("OK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("[WEBHOOK] Error processing webhook:", {
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime,
      timestamp: new Date().toISOString(),
    })

    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * Process WhatsApp Business webhook events
 */
async function processWhatsAppEvent(body: any) {
  if (!body.entry || !Array.isArray(body.entry)) {
    console.log("[WEBHOOK] No entries found in webhook event")
    return
  }

  for (const [entryIndex, entry] of body.entry.entries()) {
    console.log(`[WEBHOOK] Processing entry ${entryIndex}:`, {
      id: entry.id,
      changesCount: entry.changes?.length || 0,
    })

    if (entry.changes && Array.isArray(entry.changes)) {
      for (const [changeIndex, change] of entry.changes.entries()) {
        console.log(`[WEBHOOK] Processing change ${changeIndex}:`, {
          field: change.field,
          hasValue: !!change.value,
        })

        // Process different types of changes
        switch (change.field) {
          case "messages":
            await processMessages(change.value)
            break
          case "message_template_status_update":
            await processTemplateStatusUpdate(change.value)
            break
          default:
            console.log(`[WEBHOOK] Unhandled change field: ${change.field}`)
        }
      }
    }
  }
}

/**
 * Process incoming messages
 */
async function processMessages(value: any) {
  if (value.messages && Array.isArray(value.messages)) {
    for (const message of value.messages) {
      console.log("[WEBHOOK] Message received:", {
        id: message.id,
        from: message.from,
        type: message.type,
        timestamp: message.timestamp,
      })

      // Log message content based on type
      switch (message.type) {
        case "text":
          console.log("[WEBHOOK] Text message:", message.text?.body)
          break
        case "image":
          console.log("[WEBHOOK] Image message:", message.image?.id)
          break
        case "document":
          console.log("[WEBHOOK] Document message:", message.document?.filename)
          break
        default:
          console.log(`[WEBHOOK] Message type ${message.type} received`)
      }
    }
  }

  if (value.statuses && Array.isArray(value.statuses)) {
    for (const status of value.statuses) {
      console.log("[WEBHOOK] Message status update:", {
        id: status.id,
        status: status.status,
        timestamp: status.timestamp,
      })
    }
  }
}

/**
 * Process template status updates
 */
async function processTemplateStatusUpdate(value: any) {
  console.log("[WEBHOOK] Template status update:", {
    messageTemplateId: value.message_template_id,
    messageTemplateName: value.message_template_name,
    messageTemplateLanguage: value.message_template_language,
    event: value.event,
  })
}
