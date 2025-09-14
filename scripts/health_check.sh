#!/bin/bash

# Script para verificar el health check del webhook
# Uso: ./scripts/health_check.sh https://tu-app.vercel.app

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validar argumentos
if [[ $# -eq 0 ]]; then
    echo -e "${RED}Error: Se requiere la URL base${NC}"
    echo "Uso: $0 <URL_BASE>"
    echo "Ejemplo: $0 https://tu-app.vercel.app"
    exit 1
fi

URL="$1"
HEALTH_URL="${URL}/api/health"

echo -e "${YELLOW}🏥 Verificando health check...${NC}"
echo -e "${YELLOW}URL: $HEALTH_URL${NC}"
echo ""

# Validar que curl está disponible
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl no está instalado${NC}"
    exit 1
fi

# Hacer la petición GET
RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")

# Separar body y status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo -e "${YELLOW}📊 Respuesta del servidor:${NC}"
echo -e "${YELLOW}Status Code: $HTTP_STATUS${NC}"
echo -e "${YELLOW}Response Body:${NC}"
echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
echo ""

# Verificar status code
if [[ "$HTTP_STATUS" != "200" ]]; then
    echo -e "${RED}❌ Health check falló - Status Code: $HTTP_STATUS${NC}"
    exit 1
fi

# Verificar que el body contenga {"ok":true}
if echo "$HTTP_BODY" | jq -e '.ok == true' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check exitoso!${NC}"
    echo -e "${GREEN}   El servicio está funcionando correctamente${NC}"
    
    # Mostrar información adicional si está disponible
    if echo "$HTTP_BODY" | jq -e '.timestamp' >/dev/null 2>&1; then
        TIMESTAMP=$(echo "$HTTP_BODY" | jq -r '.timestamp')
        echo -e "${GREEN}   Timestamp: $TIMESTAMP${NC}"
    fi
    
    if echo "$HTTP_BODY" | jq -e '.uptime' >/dev/null 2>&1; then
        UPTIME=$(echo "$HTTP_BODY" | jq -r '.uptime')
        echo -e "${GREEN}   Uptime: ${UPTIME}s${NC}"
    fi
    
    exit 0
else
    echo -e "${RED}❌ Health check falló - Respuesta inválida${NC}"
    echo -e "${RED}   Se esperaba {\"ok\": true} pero se recibió:${NC}"
    echo -e "${RED}   $HTTP_BODY${NC}"
    exit 1
fi
