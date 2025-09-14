# ClubIgma WhatsApp Business Webhook

Un webhook handler robusto y seguro para la API de WhatsApp Business de Meta, construido con Next.js 14 y TypeScript.

## 🚀 Características

- ✅ Verificación de webhook de Meta (GET con hub.challenge)
- ✅ Procesamiento de eventos de webhook (POST con verificación HMAC-SHA256)
- ✅ Verificación de firmas con comparación timing-safe
- ✅ Logging detallado de eventos
- ✅ Health check endpoint
- ✅ **Documentación Swagger interactiva**
- ✅ Configuración optimizada para Vercel
- ✅ TypeScript con tipos estrictos
- ✅ Manejo de errores robusto

## 📚 Documentación de la API

### Swagger UI Interactivo

Accede a la documentación interactiva de la API en:

**🔗 URL**: `https://clubigma.vercel.app/docs`

La documentación Swagger incluye:

- ✅ **Especificación OpenAPI 3.0** completa
- ✅ **Interfaz interactiva** para probar endpoints
- ✅ **Ejemplos de requests/responses** reales
- ✅ **Esquemas de datos** detallados
- ✅ **Códigos de estado** y manejo de errores
- ✅ **Autenticación** y headers requeridos

### Endpoints Documentados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/webhook` | GET | Verificación del webhook con Meta |
| `/api/webhook` | POST | Procesamiento de eventos de WhatsApp |
| `/api/health` | GET/POST | Health check y diagnósticos |

### Usar la Documentación

1. **Explorar**: Navega por los endpoints disponibles
2. **Probar**: Usa "Try it out" para ejecutar requests reales
3. **Ejemplos**: Revisa los ejemplos de payloads de WhatsApp
4. **Esquemas**: Entiende la estructura de datos esperada

## 🧪 Pruebas

### Documentación Interactiva

La forma más fácil de probar la API es usando la documentación Swagger:

1. **Accede a la documentación**: `https://clubigma.vercel.app/docs`
2. **Explora los endpoints** disponibles
3. **Prueba directamente** desde la interfaz web
4. **Ve ejemplos** de request/response

### Health Check

\`\`\`bash
curl https://clubigma.vercel.app/api/health
\`\`\`

## 📝 Estructura del Proyecto

\`\`\`plaintext
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.ts          # Endpoint principal del webhook
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── docs/
│   │   ├── page.tsx              # Página de documentación Swagger
│   │   └── openapi.yaml/
│   │       └── route.ts          # Servir especificación OpenAPI
│   ├── page.tsx                  # Página de inicio
│   └── layout.tsx               # Layout principal
├── docs/
│   └── openapi.yaml             # Especificación OpenAPI 3.0
├── lib/
│   └── security.ts              # Utilidades de seguridad
├── components/
│   └── swagger-ui.tsx           # Componente Swagger UI
├── .env.local.example           # Ejemplo de variables de entorno
├── vercel.json                  # Configuración de Vercel
├── next.config.mjs              # Configuración de Next.js
├── README.md                    # Este archivo
└── samples/
    └── sample_body.json         # Ejemplo de body para test
