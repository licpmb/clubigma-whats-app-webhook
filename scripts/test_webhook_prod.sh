#!/bin/bash

# Script para probar webhook de WhatsApp en producción
# Uso: ./scripts/test_webhook_prod.sh --url https://clubigma.vercel.app --app-secret $APP_SECRET --body-file ./samples/sample_body.json

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
URL=""
APP_SECRET=""
BODY_FILE=""

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 --url URL --app-secret SECRET --body-file FILE"
    echo ""
    echo "Opciones:"
    echo "  --url         URL base de la aplicación (ej: https://clubigma.vercel.app)"
    echo "  --app-secret  App Secret de Meta para calcular HMAC"
    echo "  --body-file   Archivo JSON con el cuerpo del webhook"
    echo "  --help        Mostrar esta ayuda"
    echo ""
    echo "Ejemplo:"
    echo "  $0 --url https://clubigma.vercel.app --app-secret \$APP_SECRET --body-file ./samples/sample_body.json"
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            URL="$2"
            shift 2
            ;;
        --app-secret)
            APP_SECRET="$2"
            shift 2
            ;;
        --body-file)
            BODY_FILE="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Argumento desconocido $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Validar argumentos requeridos
if [[ -z "$URL" || -z "$APP_SECRET" || -z "$BODY_FILE" ]]; then
    echo -e "${RED}Error: Faltan argumentos requeridos${NC}"
    show_help
    exit 1
fi

# Validar que el archivo existe
if [[ ! -f "$BODY_FILE" ]]; then
    echo -e "${RED}Error: El archivo $BODY_FILE no existe${NC}"
    exit 1
fi

# Validar que curl y openssl están disponibles
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl no está instalado${NC}"
    exit 1
fi

if ! command -v openssl &> /dev/null; then
    echo -e "${RED}Error: openssl no está instalado${NC}"
    exit 1
fi

echo -e "${YELLOW}🧪 Probando webhook de WhatsApp en producción${NC}"
echo -e "${YELLOW}URL: $URL${NC}"
echo -e "${YELLOW}Body file: $BODY_FILE${NC}"
echo ""

# Leer el cuerpo del archivo
BODY=$(cat "$BODY_FILE")
echo -e "${YELLOW}📄 Cuerpo del webhook:${NC}"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Calcular firma HMAC-SHA256
echo -e "${YELLOW}🔐 Calculando firma HMAC-SHA256...${NC}"
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$APP_SECRET" -binary | xxd -p -c 256)
FULL_SIGNATURE="sha256=$SIGNATURE"
echo -e "${YELLOW}Firma calculada: $FULL_SIGNATURE${NC}"
echo ""

# Hacer la petición POST
echo -e "${YELLOW}📡 Enviando petición POST al webhook...${NC}"
WEBHOOK_URL="${URL}/api/webhook"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "x-hub-signature-256: $FULL_SIGNATURE" \
    -d "$BODY")

# Separar body y status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo -e "${YELLOW}📊 Respuesta del servidor:${NC}"
echo -e "${YELLOW}Status Code: $HTTP_STATUS${NC}"
echo -e "${YELLOW}Response Body:${NC}"
echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
echo ""

# Evaluar resultado
if [[ "$HTTP_STATUS" == "200" ]]; then
    echo -e "${GREEN}✅ ¡Webhook funcionando correctamente!${NC}"
    echo -e "${GREEN}   El evento fue procesado exitosamente${NC}"
    exit 0
elif [[ "$HTTP_STATUS" == "401" ]]; then
    echo -e "${RED}❌ Error de autenticación (401)${NC}"
    echo -e "${RED}   Verifica que APP_SECRET sea correcto${NC}"
    echo -e "${RED}   La firma HMAC no coincide${NC}"
    exit 1
elif [[ "$HTTP_STATUS" == "400" ]]; then
    echo -e "${RED}❌ Error de formato (400)${NC}"
    echo -e "${RED}   El cuerpo del webhook no es válido${NC}"
    exit 1
elif [[ "$HTTP_STATUS" == "500" ]]; then
    echo -e "${RED}❌ Error interno del servidor (500)${NC}"
    echo -e "${RED}   Revisa los logs de Vercel${NC}"
    exit 1
else
    echo -e "${RED}❌ Error inesperado (Status: $HTTP_STATUS)${NC}"
    echo -e "${RED}   Revisa la configuración y los logs${NC}"
    exit 1
fi
