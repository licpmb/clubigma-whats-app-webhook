const { execSync } = require("child_process")
const { createHmac } = require("node:crypto")

console.log("🧪 Testing WhatsApp Webhook...")
console.log("================================")

// Configuration
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "clubigma_verify_2025"
const APP_SECRET = process.env.APP_SECRET || "your_app_secret_here"
const BASE_URL = process.env.NODE_ENV === "production" ? "https://your-domain.vercel.app" : "http://localhost:3000"

async function runTests() {
  try {
    console.log(`Testing webhook at: ${BASE_URL}`)
    console.log("")

    // Test 1: Health Check
    console.log("1. Health Check...")
    try {
      const healthResponse = await fetch(`${BASE_URL}/api/health`)
      const healthData = await healthResponse.json()
      console.log("✅ Health check:", healthData.status)
    } catch (error) {
      console.log("❌ Health check failed:", error.message)
    }
    console.log("")

    // Test 2: GET Verification (valid)
    console.log("2. GET Verification (valid token)...")
    const challenge = `test_challenge_${Date.now()}`
    try {
      const verifyResponse = await fetch(
        `${BASE_URL}/api/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${challenge}`,
      )
      const verifyText = await verifyResponse.text()

      if (verifyText === challenge) {
        console.log("✅ GET verification successful")
      } else {
        console.log(`❌ GET verification failed. Expected: ${challenge}, Got: ${verifyText}`)
      }
    } catch (error) {
      console.log("❌ GET verification error:", error.message)
    }
    console.log("")

    // Test 3: GET Verification (invalid)
    console.log("3. GET Verification (invalid token)...")
    try {
      const invalidResponse = await fetch(
        `${BASE_URL}/api/webhook?hub.mode=subscribe&hub.verify_token=invalid_token&hub.challenge=test`,
      )

      if (invalidResponse.status === 403) {
        console.log("✅ Invalid token correctly rejected (403)")
      } else {
        console.log(`❌ Invalid token not rejected. Status: ${invalidResponse.status}`)
      }
    } catch (error) {
      console.log("❌ Invalid token test error:", error.message)
    }
    console.log("")

    // Test 4: POST with valid signature
    console.log("4. POST with valid signature...")
    const testBody = JSON.stringify({
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  {
                    id: "msg_123",
                    from: "1234567890",
                    type: "text",
                    timestamp: "1640995200",
                    text: { body: "Hello world" },
                  },
                ],
              },
            },
          ],
        },
      ],
    })

    const signature = "sha256=" + createHmac("sha256", APP_SECRET).update(testBody).digest("hex")

    try {
      const postResponse = await fetch(`${BASE_URL}/api/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hub-signature-256": signature,
        },
        body: testBody,
      })

      if (postResponse.status === 200) {
        console.log("✅ POST with valid signature accepted (200)")
      } else {
        console.log(`❌ POST with valid signature rejected. Status: ${postResponse.status}`)
      }
    } catch (error) {
      console.log("❌ POST valid signature error:", error.message)
    }
    console.log("")

    // Test 5: POST with invalid signature
    console.log("5. POST with invalid signature...")
    try {
      const invalidPostResponse = await fetch(`${BASE_URL}/api/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hub-signature-256": "sha256=invalid_signature",
        },
        body: testBody,
      })

      if (invalidPostResponse.status === 401) {
        console.log("✅ POST with invalid signature correctly rejected (401)")
      } else {
        console.log(`❌ POST with invalid signature not rejected. Status: ${invalidPostResponse.status}`)
      }
    } catch (error) {
      console.log("❌ POST invalid signature error:", error.message)
    }
    console.log("")

    console.log("🎉 Tests completed!")
    console.log("")
    console.log("📋 Summary:")
    console.log(`- Health check: Available at ${BASE_URL}/api/health`)
    console.log(`- Webhook URL: ${BASE_URL}/api/webhook`)
    console.log(`- Verify Token: ${VERIFY_TOKEN}`)
    console.log("")
    console.log("🔧 Meta Developers Configuration:")
    console.log(`- Callback URL: ${BASE_URL}/api/webhook`)
    console.log(`- Verify Token: ${VERIFY_TOKEN}`)
  } catch (error) {
    console.error("Test execution failed:", error)
  }
}

// Run tests
runTests()
