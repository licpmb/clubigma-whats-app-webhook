import Link from "next/link"
import { Suspense } from "react"

function WebhookDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">WhatsApp Business Webhook</h1>
          <p className="text-gray-600 mb-6">Webhook handler for Meta WhatsApp Business API</p>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h2 className="text-sm font-medium text-green-800 mb-2">Webhook Endpoint</h2>
              <code className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">/api/webhook</code>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-sm font-medium text-blue-800 mb-2">Health Check</h2>
              <Link
                href="/api/health"
                className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                /api/health
              </Link>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h2 className="text-sm font-medium text-purple-800 mb-2">API Documentation</h2>
              <Link
                href="/docs"
                className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
              >
                Swagger UI
              </Link>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Status: Ready for deployment</p>
            <p>Version: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <WebhookDashboard />
    </Suspense>
  )
}
