import { NextResponse } from "next/server"

const openApiSpec = `openapi: 3.0.3
info:
  title: WhatsApp Business Webhook API
  description: |
    API para manejar webhooks de WhatsApp Business con verificación segura HMAC-SHA256.
    
    ## Autenticación
    - **Webhook Verification**: Usa \`VERIFY_TOKEN\` para verificación GET
    - **Event Processing**: Requiere firma HMAC-SHA256 en header \`x-hub-signature-256\`
    
    ## Variables de Entorno Requeridas
    - \`VERIFY_TOKEN\`: Token para verificación del webhook
    - \`APP_SECRET\`: Secreto para verificación de firma HMAC
    - \`CUSTOM_KEY\`: Clave personalizada adicional
  version: 1.0.0
  contact:
    name: ClubIgma
    url: https://clubigma.com.ar
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://clubigma-wsp-api.vercel.app
    description: Producción
  - url: http://localhost:3000
    description: Desarrollo local

paths:
  /api/webhook:
    get:
      summary: Verificación del Webhook
      description: |
        Endpoint para verificar el webhook con Meta WhatsApp Business API.
        Meta envía una petición GET con parámetros de verificación.
      parameters:
        - name: hub.mode
          in: query
          required: true
          schema:
            type: string
            enum: [subscribe]
          description: Modo de verificación (debe ser 'subscribe')
        - name: hub.verify_token
          in: query
          required: true
          schema:
            type: string
          description: Token de verificación (debe coincidir con VERIFY_TOKEN)
        - name: hub.challenge
          in: query
          required: true
          schema:
            type: string
          description: Challenge string que debe ser devuelto
      responses:
        '200':
          description: Verificación exitosa
          content:
            text/plain:
              schema:
                type: string
              example: "1234567890"
        '403':
          description: Verificación fallida - token inválido o parámetros faltantes
          content:
            text/plain:
              schema:
                type: string
              example: "Forbidden"
        '500':
          description: Error de configuración del servidor
          content:
            text/plain:
              schema:
                type: string
              example: "Server configuration error"
      tags:
        - Webhook

    post:
      summary: Procesar Eventos del Webhook
      description: |
        Procesa eventos entrantes de WhatsApp Business.
        Requiere verificación de firma HMAC-SHA256 para seguridad.
      parameters:
        - name: x-hub-signature-256
          in: header
          required: true
          schema:
            type: string
          description: Firma HMAC-SHA256 del cuerpo de la petición
          example: "sha256=a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                object:
                  type: string
                  enum: [whatsapp_business_account]
                entry:
                  type: array
                  items:
                    type: object
      responses:
        '200':
          description: Evento procesado exitosamente
          content:
            text/plain:
              schema:
                type: string
              example: "OK"
        '400':
          description: Petición malformada - JSON inválido
          content:
            text/plain:
              schema:
                type: string
              example: "Bad Request"
        '401':
          description: No autorizado - firma faltante o inválida
          content:
            text/plain:
              schema:
                type: string
              example: "Unauthorized"
        '500':
          description: Error interno del servidor
          content:
            text/plain:
              schema:
                type: string
              example: "Internal Server Error"
      tags:
        - Webhook

  /api/health:
    get:
      summary: Health Check
      description: |
        Endpoint de monitoreo para verificar el estado del sistema.
        Valida variables de entorno y proporciona métricas básicas.
      responses:
        '200':
          description: Sistema saludable
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok:
                    type: boolean
                  timestamp:
                    type: string
                  uptime:
                    type: number
                  environment:
                    type: object
                  config:
                    type: object
                  responseTime:
                    type: number
        '500':
          description: Error interno del servidor
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok:
                    type: boolean
                  error:
                    type: string
      tags:
        - Health

tags:
  - name: Webhook
    description: Endpoints para manejo de webhooks de WhatsApp Business
  - name: Health
    description: Endpoints de monitoreo y salud del sistema`

export async function GET() {
  try {
    return new NextResponse(openApiSpec, {
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
