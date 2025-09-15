"use client"

import { useEffect, useRef } from "react"

interface SwaggerUIProps {
  spec: string | object
  domId?: string
}

export default function SwaggerUI({ spec, domId = "swagger-ui" }: SwaggerUIProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadSwaggerUI = async () => {
      try {
        const [SwaggerUIBundle, SwaggerUIStandalonePreset] = await Promise.all([
          import("swagger-ui-dist/swagger-ui-bundle.js" as any).then((m: any) => m.default),
          import("swagger-ui-dist/swagger-ui-standalone-preset.js" as any).then((m: any) => m.default),
        ])

        // Initialize Swagger UI
        SwaggerUIBundle({
          url: "/docs/openapi.yaml",
          dom_id: `#${domId}`,
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
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

        // Fallback content
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-8 text-center">
              <h3 class="text-lg font-semibold mb-4">Error cargando Swagger UI</h3>
              <p class="text-muted-foreground mb-4">No se pudo cargar la interfaz interactiva.</p>
              <a href="/docs/openapi.yaml" class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Ver especificación OpenAPI
              </a>
            </div>
          `
        }
      }
    }

    loadSwaggerUI()
  }, [domId, spec])

  return <div ref={containerRef} id={domId} className="swagger-ui-container" />
}
