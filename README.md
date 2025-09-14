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

### Verificación GET (Webhook Verification)

\`\`\`bash
curl "https://tu-app.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=clubigma_verify_2025&hub.challenge=test_challenge"
\`\`\`

**Respuesta esperada**: `test_challenge`

### Scripts de Producción

#### Health Check Automatizado

\`\`\`bash
# Hacer ejecutable
chmod +x scripts/health_check.sh

# Ejecutar contra producción
./scripts/health_check.sh https://tu-app.vercel.app
\`\`\`

#### Test Completo del Webhook

\`\`\`bash
# Hacer ejecutable
chmod +x scripts/test_webhook_prod.sh

# Ejecutar con tu APP_SECRET
./scripts/test_webhook_prod.sh \
  --url https://tu-app.vercel.app \
  --app-secret $APP_SECRET \
  --body-file ./samples/sample_body.json
\`\`\`

**Resultados esperados:**
- ✅ **Status 200**: Webhook funcionando correctamente
- ❌ **Status 401**: Error de autenticación (verificar APP_SECRET)
- ❌ **Status 400**: Error de formato en el body
- ❌ **Status 500**: Error interno (revisar logs de Vercel)

### CI/CD con GitHub Actions

#### Configurar Secrets

En tu repositorio de GitHub, ve a **Settings > Secrets and variables > Actions** y agrega:

1. **PROD_URL** (requerido)
   \`\`\`
   https://tu-app.vercel.app
   \`\`\`

2. **APP_SECRET** (opcional, para test completo)
   \`\`\`
   tu_app_secret_de_meta_aqui
   \`\`\`

#### Workflow Automático

El workflow `.github/workflows/post-deploy-check.yml` se ejecuta automáticamente en cada push a `main` y:

1. ✅ Ejecuta health check contra producción
2. 🧪 Si `APP_SECRET` está configurado, ejecuta test completo del webhook
3. 📊 Reporta el estado en la pestaña "Actions" de GitHub

#### Comandos Manuales

\`\`\`bash
# Ejecutar workflow manualmente desde GitHub UI
# O usar GitHub CLI:
gh workflow run post-deploy-check.yml
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

## 📊 Monitoring y Logs

### Logs en Vercel

\`\`\`bash
vercel logs https://tu-app.vercel.app
\`\`\`

### Resultados Esperados en Logs

**Health Check exitoso:**
\`\`\`
[HEALTH] Health check request received
[HEALTH] System status: OK, uptime: 123.45s
\`\`\`

**Webhook verification exitoso:**
\`\`\`
[WEBHOOK] GET verification request: { mode: 'subscribe', hasToken: true, hasChallenge: true }
[WEBHOOK] Verification successful
\`\`\`

**Evento POST exitoso:**
\`\`\`
[WEBHOOK] POST request received: { hasSignature: true, bodyLength: 1234 }
[WEBHOOK] HMAC signature verified successfully
[WEBHOOK] Event received and verified: { object: 'whatsapp_business_account', entryCount: 1 }
\`\`\`

**Error de autenticación (401):**
\`\`\`
[WEBHOOK] POST request received: { hasSignature: true, bodyLength: 1234 }
[SECURITY] HMAC signature verification failed
[WEBHOOK] Unauthorized request rejected
\`\`\`

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
├── README.md                    # Este archivo
├── scripts/
│   ├── health_check.sh          # Script para health check
│   └── test_webhook_prod.sh     # Script para test completo del webhook
└── samples/
    └── sample_body.json         # Ejemplo de body para test
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
