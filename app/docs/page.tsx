"use client"

import { Suspense, useEffect } from "react"
import "swagger-ui-dist/swagger-ui.css"

function SwaggerUI() {
  useEffect(() => {
    const loadSwaggerUI = async () => {
      try {
        const [SwaggerUIBundle, SwaggerUIStandalonePreset] = await Promise.all([
          import("swagger-ui-dist/swagger-ui-bundle.js").then((m) => m.default),
          import("swagger-ui-dist/swagger-ui-standalone-preset.js").then((m) => m.default),
        ])

        SwaggerUIBundle({
          url: "/docs/openapi.yaml",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
          supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
          requestInterceptor: (request: any) => {
            console.log("[SWAGGER] Request:", request)
            return request
          },
          responseInterceptor: (response: any) => {
            console.log("[SWAGGER] Response:", response)
            return response
          },
        })
      } catch (error) {
        console.error("[SWAGGER] Error loading Swagger UI:", error)

        const container = document.getElementById("swagger-ui")
        if (container) {
          container.innerHTML = `
            <div class="p-8 text-center">
              <h3 class="text-lg font-semibold mb-4">Error cargando Swagger UI</h3>
              <p class="text-gray-600 mb-4">No se pudo cargar la interfaz interactiva.</p>
              <a href="/docs/openapi.yaml" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Ver especificación OpenAPI
              </a>
            </div>
          `
        }
      }
    }

    loadSwaggerUI()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">WhatsApp Business Webhook API</h1>
          <p className="text-muted-foreground text-lg">
            Documentación interactiva de la API para webhooks de WhatsApp Business
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold mb-4">Documentación Swagger</h2>
            <p className="text-muted-foreground mb-4">
              Usa esta interfaz para explorar y probar los endpoints de la API.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm mb-2">🔗 Endpoints Disponibles</h3>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-background px-2 py-1 rounded">GET /api/webhook</code> - Verificación
                  </li>
                  <li>
                    <code className="bg-background px-2 py-1 rounded">POST /api/webhook</code> - Eventos
                  </li>
                  <li>
                    <code className="bg-background px-2 py-1 rounded">GET /api/health</code> - Health Check
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm mb-2">🔐 Autenticación</h3>
                <ul className="text-sm space-y-1">
                  <li>VERIFY_TOKEN para verificación GET</li>
                  <li>HMAC-SHA256 para eventos POST</li>
                  <li>Header: x-hub-signature-256</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Swagger UI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                La documentación interactiva se carga a continuación. Puedes probar los endpoints directamente desde
                aquí.
              </p>
            </div>

            <div id="swagger-ui" className="min-h-[600px] border rounded-lg overflow-hidden">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando Swagger UI...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Inicio Rápido</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">1. Verificar Health Check:</p>
                <code className="block bg-muted p-2 rounded text-xs">curl https://clubigma.vercel.app/api/health</code>
              </div>
              <div>
                <p className="font-medium mb-1">2. Probar Verificación:</p>
                <code className="block bg-muted p-2 rounded text-xs break-all">
                  curl
                  "https://clubigma.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=tu_token&hub.challenge=test"
                </code>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Variables de Entorno</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">VERIFY_TOKEN</span>
                <span className="text-muted-foreground">Verificación webhook</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">APP_SECRET</span>
                <span className="text-muted-foreground">Firma HMAC</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">CUSTOM_KEY</span>
                <span className="text-muted-foreground">Clave personalizada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando documentación...</p>
          </div>
        </div>
      }
    >
      <SwaggerUI />
    </Suspense>
  )
}
