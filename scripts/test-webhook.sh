#!/bin/bash

# Script para probar el webhook localmente y en producción
# Uso: ./scripts/test-webhook.sh [local|prod] [URL_BASE]

set -e

# Configuración
VERIFY_TOKEN="clubigma_verify_2025"
APP_SECRET="${APP_SECRET:-10bdf1ef2f112464dc7b78f6547f60cc}"

# Determinar URL base
if [ "$1" = "local" ]; then
    BASE_URL="http://localhost:3000"
elif [ "$1" = "prod" ]; then
    BASE_URL="${2:-https://clubigma-wsp-api.vercel.app}"
else
    echo "Uso: $0 [local|prod] [URL_BASE]"
    echo "Ejemplo: $0 local"
    echo "Ejemplo: $0 prod https://clubigma-wsp-api.vercel.app"
    exit 1
fi

echo "🧪 Probando webhook en: $BASE_URL"
echo "=================================="

# Test 1: Health Check
echo "1. Health Check..."
curl -s "$BASE_URL/api/health" | jq '.' || echo "❌ Health check falló"
echo "✅ Health check completado"
echo ""

# Test 2: Verificación GET (válida)
echo "2. Verificación GET (válida)..."
CHALLENGE="test_challenge_$(date +%s)"
RESPONSE=$(curl -s "$BASE_URL/api/webhook?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=$CHALLENGE")

if [ "$RESPONSE" = "$CHALLENGE" ]; then
    echo "✅ Verificación GET exitosa"
else
    echo "❌ Verificación GET falló. Esperado: $CHALLENGE, Recibido: $RESPONSE"
fi
echo ""

# Test 3: Verificación GET (inválida)
echo "3. Verificación GET (token inválido)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/webhook?hub.mode=subscribe&hub.verify_token=token_invalido&hub.challenge=test")

if [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Verificación GET con token inválido rechazada correctamente (403)"
else
    echo "❌ Verificación GET con token inválido no rechazada. Código: $HTTP_CODE"
fi
echo ""

# Test 4: POST con firma válida
echo "4. POST con firma válida..."
TEST_BODY='{"object":"whatsapp_business_account","entry":[{"id":"123","changes":[{"field":"messages","value":{"messages":[{"id":"msg_123","from":"1234567890","type":"text","timestamp":"1640995200","text":{"body":"Hola mundo"}}]}}]}]}'

# Calcular firma HMAC
SIGNATURE="sha256=$(echo -n "$TEST_BODY" | openssl dgst -sha256 -hmac "$APP_SECRET" -binary | xxd -p -c 256)"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/webhook" \
    -H "Content-Type: application/json" \
    -H "x-hub-signature-256: $SIGNATURE" \
    -d "$TEST_BODY")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ POST con firma válida aceptado (200)"
else
    echo "❌ POST con firma válida rechazado. Código: $HTTP_CODE"
fi
echo ""

# Test 5: POST con firma inválida
echo "5. POST con firma inválida..."
INVALID_SIGNATURE="sha256=firma_invalida"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/webhook" \
    -H "Content-Type: application/json" \
    -H "x-hub-signature-256: $INVALID_SIGNATURE" \
    -d "$TEST_BODY")

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ POST con firma inválida rechazado correctamente (401)"
else
    echo "❌ POST con firma inválida no rechazado. Código: $HTTP_CODE"
fi
echo ""

# Test 6: POST sin firma
echo "6. POST sin firma..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/webhook" \
    -H "Content-Type: application/json" \
    -d "$TEST_BODY")

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ POST sin firma rechazado correctamente (401)"
else
    echo "❌ POST sin firma no rechazado. Código: $HTTP_CODE"
fi
echo ""

echo "🎉 Pruebas completadas!"
echo ""
echo "📋 Resumen:"
echo "- Health check: Disponible en $BASE_URL/api/health"
echo "- Webhook URL: $BASE_URL/api/webhook"
echo "- Verify Token: $VERIFY_TOKEN"
echo ""
echo "🔧 Para configurar en Meta Developers:"
echo "- Callback URL: $BASE_URL/api/webhook"
echo "- Verify Token: $VERIFY_TOKEN"
