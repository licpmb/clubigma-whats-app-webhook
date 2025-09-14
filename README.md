# ClubIgma WhatsApp Business Webhook

Un webhook handler robusto y seguro para la API de WhatsApp Business de Meta, construido con Next.js 14 y TypeScript.

## 🚀 Características

- ✅ Verificación de webhook de Meta (GET con hub.challenge)
- ✅ Procesamiento de eventos de webhook (POST con verificación HMAC-SHA256)
- ✅ Verificación de firmas con comparación timing-safe
- ✅ Logging detallado de eventos
- ✅ Health check endpoint
- ✅ Configuración optimizada para Vercel
- ✅ TypeScript con tipos estrictos
- ✅ Manejo de errores robusto

## 📋 Requisitos

- Node.js 18.0.0 o superior
- Cuenta de Vercel (para deployment)
- App de WhatsApp Business configurada en Meta Developers

## 🛠️ Instalación Local

1. **Clonar el repositorio**
   \`\`\`bash
   git clone https://github.com/clubigma/clubigma-whatsapp-webhook.git
   cd clubigma-whatsapp-webhook
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar variables de entorno**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   
   Editar `.env.local` con tus valores:
   \`\`\`env
   VERIFY_TOKEN=clubigma_verify_2025
   APP_SECRET=tu_app_secret_de_meta_aqui
   \`\`\`

4. **Ejecutar en desarrollo**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Exponer con ngrok (para pruebas locales)**
   \`\`\`bash
   # En otra terminal
   npx ngrok http 3000
   \`\`\`

## 🌐 Deployment en Vercel

### Opción 1: Deploy desde GitHub

1. **Crear repositorio en GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/clubigma/clubigma-whatsapp-webhook.git
   git push -u origin main
   \`\`\`

2. **Conectar a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio
   - Configura las variables de entorno:
     - `VERIFY_TOKEN`: `clubigma_verify_2025`
     - `APP_SECRET`: Tu App Secret de Meta

### Opción 2: Deploy directo con CLI

\`\`\`bash
npm install -g vercel
vercel login
vercel --prod
\`\`\`

## 🔧 Configuración en Meta Developers

1. **Accede a Meta Developers Console**
   - Ve a [developers.facebook.com](https://developers.facebook.com)
   - Selecciona tu app de WhatsApp Business

2. **Configurar Webhook**
   - Ve a WhatsApp > Configuration
   - En "Webhook", haz clic en "Configure"
   - **Callback URL**: `https://tu-app.vercel.app/api/webhook`
   - **Verify Token**: `clubigma_verify_2025` (debe coincidir con tu env var)
   - Haz clic en "Verify and Save"

3. **Suscribirse a eventos**
   - Selecciona los eventos que quieres recibir:
     - `messages` (mensajes entrantes)
     - `message_deliveries` (confirmaciones de entrega)
     - `message_reads` (confirmaciones de lectura)
     - `message_template_status_update` (actualizaciones de plantillas)

## 🧪 Pruebas

### Verificación GET (Webhook Verification)

\`\`\`bash
curl "https://tu-app.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=clubigma_verify_2025&hub.challenge=test_challenge"
\`\`\`

**Respuesta esperada**: `test_challenge`

### Health Check

\`\`\`bash
curl https://tu-app.vercel.app/api/health
\`\`\`

**Respuesta esperada**:
\`\`\`json
{
  "ok": true,
  "timestamp": "2025-01-XX...",
  "uptime": 123.456,
  "environment": {...},
  "config": {...}
}
\`\`\`

### Evento POST (Simulación)

\`\`\`bash
# Generar firma HMAC (reemplaza APP_SECRET y BODY)
echo -n '{"test":"data"}' | openssl dgst -sha256 -hmac "tu_app_secret" -binary | base64

# Enviar evento
curl -X POST https://tu-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=FIRMA_CALCULADA" \
  -d '{"test":"data"}'
\`\`\`

## 📊 Monitoring y Logs

### Logs en Vercel

\`\`\`bash
vercel logs https://tu-app.vercel.app
\`\`\`

### Logs locales

Los logs se muestran en la consola con prefijos identificables:
- `[WEBHOOK]` - Eventos del webhook
- `[SECURITY]` - Verificaciones de seguridad
- `[HEALTH]` - Health checks

### Ejemplo de logs

\`\`\`
[WEBHOOK] GET verification request: { mode: 'subscribe', hasToken: true, hasChallenge: true }
[WEBHOOK] Verification successful
[WEBHOOK] POST request received: { hasSignature: true, bodyLength: 1234 }
[WEBHOOK] Event received and verified: { object: 'whatsapp_business_account', entryCount: 1 }
\`\`\`

## 🔒 Seguridad

### Verificación de Firmas

- Usa HMAC-SHA256 para verificar la autenticidad de los eventos
- Implementa comparación timing-safe para prevenir ataques de timing
- No registra secretos en los logs

### Variables de Entorno

- `VERIFY_TOKEN`: Token para verificación inicial del webhook
- `APP_SECRET`: Secreto de la app para verificación HMAC (mínimo 16 caracteres)

### Buenas Prácticas

- Nunca commitees las variables de entorno al repositorio
- Usa tokens seguros y únicos
- Monitorea los logs para detectar intentos de acceso no autorizado

## 🐛 Troubleshooting

### Error 403 en verificación

- Verifica que `VERIFY_TOKEN` coincida exactamente
- Revisa que la URL del webhook sea correcta

### Error 401 en eventos POST

- Verifica que `APP_SECRET` sea correcto
- Asegúrate de que la firma se calcule con el raw body
- Revisa que el header `x-hub-signature-256` esté presente

### Error 500

- Revisa los logs de Vercel: `vercel logs`
- Verifica que las variables de entorno estén configuradas
- Usa el endpoint `/api/health` para diagnosticar

### Webhook no recibe eventos

1. Verifica la configuración en Meta Developers
2. Asegúrate de estar suscrito a los eventos correctos
3. Revisa que la URL del webhook sea accesible públicamente
4. Usa el health check para verificar que el servicio esté funcionando

## 📝 Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.ts          # Endpoint principal del webhook
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── page.tsx                  # Página de inicio
│   └── layout.tsx               # Layout principal
├── lib/
│   └── security.ts              # Utilidades de seguridad
├── .env.local.example           # Ejemplo de variables de entorno
├── vercel.json                  # Configuración de Vercel
├── next.config.mjs              # Configuración de Next.js
└── README.md                    # Este archivo
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Troubleshooting](#-troubleshooting)
2. Abre un [Issue](https://github.com/clubigma/clubigma-whatsapp-webhook/issues)
3. Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ por ClubIgma**
