# Guía de Deployment

Esta guía te llevará paso a paso para desplegar el webhook de WhatsApp Business en Vercel.

## 🚀 Deployment Automático

### 1. Preparar el Repositorio

\`\`\`bash
# Inicializar git si no está inicializado
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: WhatsApp Business webhook"

# Crear rama main
git branch -M main

# Agregar remote origin (reemplaza con tu URL)
git remote add origin https://github.com/clubigma/clubigma-whatsapp-webhook.git

# Push inicial
git push -u origin main
\`\`\`

### 2. Conectar con Vercel

#### Opción A: Desde la Web UI

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Haz clic en "Deploy"

#### Opción B: Desde CLI

\`\`\`bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Login en Vercel
vercel login

# Deploy del proyecto
vercel --prod
\`\`\`

### 3. Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto
2. Haz clic en "Settings"
3. Ve a "Environment Variables"
4. Agrega las siguientes variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VERIFY_TOKEN` | `clubigma_verify_2025` | Production, Preview, Development |
| `APP_SECRET` | `tu_app_secret_de_meta` | Production, Preview, Development |

### 4. Verificar Deployment

Una vez desplegado, verifica que todo funcione:

\`\`\`bash
# Health check
curl https://tu-proyecto.vercel.app/api/health

# Verificación de webhook
curl "https://tu-proyecto.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=clubigma_verify_2025&hub.challenge=test"
\`\`\`

## 🔧 Configuración en Meta Developers

### 1. Acceder a Meta Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Selecciona tu app de WhatsApp Business
3. Ve a "WhatsApp" > "Configuration"

### 2. Configurar Webhook

1. En la sección "Webhook", haz clic en "Configure"
2. Completa los campos:
   - **Callback URL**: `https://tu-proyecto.vercel.app/api/webhook`
   - **Verify Token**: `clubigma_verify_2025`
3. Haz clic en "Verify and Save"

### 3. Suscribirse a Eventos

Selecciona los eventos que quieres recibir:

- ✅ `messages` - Mensajes entrantes
- ✅ `message_deliveries` - Confirmaciones de entrega
- ✅ `message_reads` - Confirmaciones de lectura
- ✅ `message_template_status_update` - Actualizaciones de plantillas

## 🔄 Deployment Continuo

### GitHub Actions (Opcional)

Crea `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run type check
        run: npm run type-check
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 📊 Monitoreo Post-Deployment

### 1. Verificar Logs

\`\`\`bash
# Ver logs en tiempo real
vercel logs https://tu-proyecto.vercel.app --follow

# Ver logs específicos
vercel logs https://tu-proyecto.vercel.app --since=1h
\`\`\`

### 2. Configurar Alertas

En Vercel Dashboard:
1. Ve a "Settings" > "Notifications"
2. Configura alertas para:
   - Deployment failures
   - Function errors
   - High response times

### 3. Métricas de Performance

Monitorea:
- Response times del webhook
- Error rates
- Function invocations
- Bandwidth usage

## 🐛 Troubleshooting de Deployment

### Error: "Function Timeout"

\`\`\`json
// vercel.json
{
  "functions": {
    "app/api/webhook/route.ts": {
      "maxDuration": 30
    }
  }
}
\`\`\`

### Error: "Environment Variables Not Found"

1. Verifica que las variables estén configuradas en Vercel
2. Asegúrate de que estén disponibles en todos los environments
3. Redeploy después de agregar variables

### Error: "Build Failed"

\`\`\`bash
# Verificar localmente
npm run build

# Ver logs detallados
vercel logs --build
\`\`\`

### Webhook No Recibe Eventos

1. Verifica la URL en Meta Developers
2. Asegúrate de que el deployment esté activo
3. Revisa los logs de Vercel
4. Usa el health check para verificar conectividad

## 🔒 Seguridad en Producción

### 1. Variables de Entorno

- Nunca hardcodees secretos en el código
- Usa variables de entorno para todos los valores sensibles
- Rota regularmente el `APP_SECRET`

### 2. Monitoring

- Configura alertas para intentos de acceso no autorizado
- Monitorea patrones de tráfico inusuales
- Revisa regularmente los logs de seguridad

### 3. Rate Limiting (Opcional)

Para protección adicional, considera implementar rate limiting:

\`\`\`typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server';

const requests = new Map();

export function rateLimit(request: NextRequest, limit = 100, window = 60000) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - window;
  
  if (!requests.has(ip)) {
    requests.set(ip, []);
  }
  
  const userRequests = requests.get(ip);
  const recentRequests = userRequests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  
  return true;
}
\`\`\`

---

¡Tu webhook de WhatsApp Business está listo para producción! 🎉
