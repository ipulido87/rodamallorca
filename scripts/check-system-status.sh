#!/usr/bin/env bash
#
# check-system-status.sh
# Verifica el estado completo del sistema RodaMallorca
#
# Uso: ./scripts/check-system-status.sh [--api-url URL] [--port PORT]
#
# Ejemplo:
#   ./scripts/check-system-status.sh
#   ./scripts/check-system-status.sh --api-url api.rodamallorca.es --port 4000
#

set -euo pipefail

# --- Colores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# --- Configuracion por defecto ---
API_HOST="api.rodamallorca.es"
API_PORT="4000"
PROTOCOL="https"
FRONTEND_HOST="rodamallorca.es"
TIMEOUT=10
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNED=0

# --- Parsear argumentos ---
while [[ $# -gt 0 ]]; do
  case $1 in
    --api-url)
      API_HOST="$2"
      shift 2
      ;;
    --port)
      API_PORT="$2"
      shift 2
      ;;
    --protocol)
      PROTOCOL="$2"
      shift 2
      ;;
    --help)
      echo "Uso: $0 [--api-url HOST] [--port PORT] [--protocol https|http]"
      exit 0
      ;;
    *)
      echo "Argumento desconocido: $1"
      exit 1
      ;;
  esac
done

# --- URL base ---
if [[ "$PROTOCOL" == "https" ]]; then
  API_BASE="${PROTOCOL}://${API_HOST}"
else
  API_BASE="${PROTOCOL}://${API_HOST}:${API_PORT}"
fi

# --- Funciones de utilidad ---
print_header() {
  echo ""
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_section() {
  echo ""
  echo -e "${BOLD}${CYAN}▸ $1${NC}"
  echo -e "${CYAN}─────────────────────────────────${NC}"
}

check_pass() {
  echo -e "  ${GREEN}✓${NC} $1"
  ((CHECKS_PASSED++))
}

check_fail() {
  echo -e "  ${RED}✗${NC} $1"
  ((CHECKS_FAILED++))
}

check_warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
  ((CHECKS_WARNED++))
}

check_info() {
  echo -e "  ${BLUE}ℹ${NC} $1"
}

# --- Comprobar herramientas disponibles ---
HAS_DIG=false
HAS_CURL=false
HAS_NC=false

command -v dig &>/dev/null && HAS_DIG=true
command -v curl &>/dev/null && HAS_CURL=true
command -v nc &>/dev/null && HAS_NC=true

# =============================================================================
# INICIO DEL CHECK
# =============================================================================
print_header "RodaMallorca - System Status Check"
echo -e "  Fecha:     $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo -e "  API Host:  ${API_HOST}"
echo -e "  API Base:  ${API_BASE}"
echo -e "  Puerto:    ${API_PORT}"

# =============================================================================
# 1. DNS Records
# =============================================================================
print_section "1. DNS Records"

if $HAS_DIG; then
  # A Records
  echo -e "  ${BOLD}A Records (${API_HOST}):${NC}"
  A_RECORDS=$(dig +short A "$API_HOST" 2>/dev/null)
  if [[ -n "$A_RECORDS" ]]; then
    while IFS= read -r ip; do
      check_pass "A: $ip"
    done <<< "$A_RECORDS"
  else
    check_fail "No A records found for ${API_HOST}"
  fi

  # AAAA Records (IPv6)
  echo -e "  ${BOLD}AAAA Records (${API_HOST}):${NC}"
  AAAA_RECORDS=$(dig +short AAAA "$API_HOST" 2>/dev/null)
  if [[ -n "$AAAA_RECORDS" ]]; then
    while IFS= read -r ip6; do
      check_pass "AAAA: $ip6"
    done <<< "$AAAA_RECORDS"
  else
    check_info "No AAAA records (IPv6 not configured)"
  fi

  # CNAME Records
  echo -e "  ${BOLD}CNAME Records (${API_HOST}):${NC}"
  CNAME_RECORDS=$(dig +short CNAME "$API_HOST" 2>/dev/null)
  if [[ -n "$CNAME_RECORDS" ]]; then
    while IFS= read -r cname; do
      check_pass "CNAME: $cname"
    done <<< "$CNAME_RECORDS"
  else
    check_info "No CNAME records (direct A record)"
  fi

  # MX Records (dominio principal)
  echo -e "  ${BOLD}MX Records (${FRONTEND_HOST}):${NC}"
  MX_RECORDS=$(dig +short MX "$FRONTEND_HOST" 2>/dev/null)
  if [[ -n "$MX_RECORDS" ]]; then
    while IFS= read -r mx; do
      check_pass "MX: $mx"
    done <<< "$MX_RECORDS"
  else
    check_warn "No MX records for ${FRONTEND_HOST} (email may not work)"
  fi

  # TXT Records (SPF, DKIM, etc.)
  echo -e "  ${BOLD}TXT Records (${FRONTEND_HOST}):${NC}"
  TXT_RECORDS=$(dig +short TXT "$FRONTEND_HOST" 2>/dev/null)
  if [[ -n "$TXT_RECORDS" ]]; then
    while IFS= read -r txt; do
      check_info "TXT: $txt"
    done <<< "$TXT_RECORDS"
  else
    check_info "No TXT records"
  fi

  # NS Records
  echo -e "  ${BOLD}NS Records (${FRONTEND_HOST}):${NC}"
  NS_RECORDS=$(dig +short NS "$FRONTEND_HOST" 2>/dev/null)
  if [[ -n "$NS_RECORDS" ]]; then
    while IFS= read -r ns; do
      check_info "NS: $ns"
    done <<< "$NS_RECORDS"
  else
    check_warn "No NS records found"
  fi

else
  # Fallback: usar Python o getent para resolución DNS
  echo -e "  ${YELLOW}(dig no disponible, usando resolución basica)${NC}"
  RESOLVED_IP=$(getent hosts "$API_HOST" 2>/dev/null | awk '{print $1}' || python3 -c "import socket; print(socket.gethostbyname('$API_HOST'))" 2>/dev/null || echo "")
  if [[ -n "$RESOLVED_IP" ]]; then
    check_pass "Resolves to: $RESOLVED_IP"
  else
    check_fail "Cannot resolve ${API_HOST}"
  fi
fi

# =============================================================================
# 2. Port Connectivity
# =============================================================================
print_section "2. Port Connectivity"

check_port() {
  local host="$1"
  local port="$2"
  local label="$3"

  if $HAS_NC; then
    if nc -z -w "$TIMEOUT" "$host" "$port" 2>/dev/null; then
      check_pass "${label} (${host}:${port}) - OPEN"
    else
      check_fail "${label} (${host}:${port}) - CLOSED/FILTERED"
    fi
  elif $HAS_CURL; then
    if curl -s --connect-timeout "$TIMEOUT" "telnet://${host}:${port}" &>/dev/null; then
      check_pass "${label} (${host}:${port}) - OPEN"
    else
      check_fail "${label} (${host}:${port}) - CLOSED/FILTERED"
    fi
  else
    check_warn "${label} - Cannot check (nc/curl not available)"
  fi
}

# Check HTTPS (443)
check_port "$API_HOST" 443 "HTTPS"

# Check HTTP (80)
check_port "$API_HOST" 80 "HTTP"

# Check custom port if different
if [[ "$API_PORT" != "443" && "$API_PORT" != "80" ]]; then
  check_port "$API_HOST" "$API_PORT" "API Port"
fi

# =============================================================================
# 3. SSL/TLS Certificate
# =============================================================================
print_section "3. SSL/TLS Certificate"

if $HAS_CURL; then
  SSL_INFO=$(curl -svI --max-time "$TIMEOUT" "https://${API_HOST}/" 2>&1 || true)

  # Check SSL connection
  if echo "$SSL_INFO" | grep -q "SSL connection using"; then
    SSL_PROTO=$(echo "$SSL_INFO" | grep "SSL connection using" | head -1)
    check_pass "SSL handshake successful"
    check_info "${SSL_PROTO##*\* }"
  else
    SSL_ERROR=$(echo "$SSL_INFO" | grep -i "ssl\|certificate\|tls" | head -3)
    if [[ -n "$SSL_ERROR" ]]; then
      check_fail "SSL handshake failed"
      echo "$SSL_ERROR" | while IFS= read -r line; do
        check_info "  $line"
      done
    fi
  fi

  # Certificate expiry
  CERT_EXPIRY=$(echo "$SSL_INFO" | grep -i "expire date" | head -1 | sed 's/.*expire date: //')
  if [[ -n "$CERT_EXPIRY" ]]; then
    EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || echo "")
    NOW_EPOCH=$(date +%s)
    if [[ -n "$EXPIRY_EPOCH" ]]; then
      DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
      if [[ $DAYS_LEFT -gt 30 ]]; then
        check_pass "Certificate expires in ${DAYS_LEFT} days ($CERT_EXPIRY)"
      elif [[ $DAYS_LEFT -gt 7 ]]; then
        check_warn "Certificate expires in ${DAYS_LEFT} days ($CERT_EXPIRY)"
      elif [[ $DAYS_LEFT -gt 0 ]]; then
        check_fail "Certificate expires in ${DAYS_LEFT} days! ($CERT_EXPIRY)"
      else
        check_fail "Certificate EXPIRED ($CERT_EXPIRY)"
      fi
    else
      check_info "Certificate expiry: $CERT_EXPIRY"
    fi
  fi

  # Certificate issuer
  CERT_ISSUER=$(echo "$SSL_INFO" | grep -i "issuer:" | head -1 | sed 's/.*issuer: //')
  if [[ -n "$CERT_ISSUER" ]]; then
    check_info "Issuer: $CERT_ISSUER"
  fi
fi

# =============================================================================
# 4. API Health Check
# =============================================================================
print_section "4. API Health Check"

if $HAS_CURL; then
  HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time "$TIMEOUT" "${API_BASE}/api/health" 2>/dev/null || echo -e "\n000\n0")
  HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -1)
  HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | sed -n '2p')
  HEALTH_TIME=$(echo "$HEALTH_RESPONSE" | sed -n '3p')

  if [[ "$HEALTH_STATUS" == "200" && "$HEALTH_BODY" == "ok" ]]; then
    check_pass "Health endpoint: HTTP ${HEALTH_STATUS} - ${HEALTH_BODY} (${HEALTH_TIME}s)"
  elif [[ "$HEALTH_STATUS" == "200" ]]; then
    check_pass "Health endpoint: HTTP ${HEALTH_STATUS} (${HEALTH_TIME}s)"
    check_info "Response: ${HEALTH_BODY}"
  elif [[ "$HEALTH_STATUS" == "000" ]]; then
    check_fail "Health endpoint: Connection failed (timeout or DNS error)"
  else
    check_fail "Health endpoint: HTTP ${HEALTH_STATUS} (${HEALTH_TIME}s)"
    check_info "Response: ${HEALTH_BODY}"
  fi
else
  check_warn "curl not available - cannot check health endpoint"
fi

# =============================================================================
# 5. API Endpoints Spot Check
# =============================================================================
print_section "5. API Endpoints Spot Check"

check_endpoint() {
  local path="$1"
  local label="$2"
  local expected_status="${3:-200}"

  if ! $HAS_CURL; then
    check_warn "${label} - curl not available"
    return
  fi

  local response
  response=$(curl -s -o /dev/null -w "%{http_code} %{time_total}" --max-time "$TIMEOUT" "${API_BASE}${path}" 2>/dev/null || echo "000 0")
  local status
  status=$(echo "$response" | awk '{print $1}')
  local time
  time=$(echo "$response" | awk '{print $2}')

  if [[ "$status" == "$expected_status" ]]; then
    check_pass "${label}: HTTP ${status} (${time}s)"
  elif [[ "$status" == "000" ]]; then
    check_fail "${label}: Connection failed"
  elif [[ "$status" =~ ^[45] ]]; then
    # 4xx or 5xx but might be expected (e.g., 401 for auth-required endpoints)
    if [[ "$status" == "401" || "$status" == "403" ]]; then
      check_pass "${label}: HTTP ${status} - Auth required (expected) (${time}s)"
    else
      check_warn "${label}: HTTP ${status} (${time}s)"
    fi
  else
    check_info "${label}: HTTP ${status} (${time}s)"
  fi
}

check_endpoint "/api/health" "Health"
check_endpoint "/api/catalog/products" "Catalog (products)"
check_endpoint "/api/directory" "Directory (workshops)"
check_endpoint "/api/auth/me" "Auth (me)" "401"

# =============================================================================
# 6. Response Headers Check
# =============================================================================
print_section "6. Response Headers"

if $HAS_CURL; then
  HEADERS=$(curl -sI --max-time "$TIMEOUT" "${API_BASE}/api/health" 2>/dev/null || echo "")

  if [[ -n "$HEADERS" ]]; then
    # Check CORS headers
    if echo "$HEADERS" | grep -qi "access-control"; then
      check_pass "CORS headers present"
    else
      check_info "No CORS headers on health endpoint (normal for same-origin)"
    fi

    # Check security headers
    if echo "$HEADERS" | grep -qi "x-powered-by"; then
      POWERED_BY=$(echo "$HEADERS" | grep -i "x-powered-by" | head -1)
      check_warn "X-Powered-By header exposed (consider removing): ${POWERED_BY##*: }"
    else
      check_pass "X-Powered-By header not exposed"
    fi

    # Content-Type
    CONTENT_TYPE=$(echo "$HEADERS" | grep -i "content-type" | head -1)
    if [[ -n "$CONTENT_TYPE" ]]; then
      check_info "Content-Type: ${CONTENT_TYPE##*: }"
    fi

    # Server header
    SERVER_HEADER=$(echo "$HEADERS" | grep -i "^server:" | head -1)
    if [[ -n "$SERVER_HEADER" ]]; then
      check_info "Server: ${SERVER_HEADER##*: }"
    fi
  else
    check_fail "Could not fetch response headers"
  fi
fi

# =============================================================================
# 7. Frontend Check
# =============================================================================
print_section "7. Frontend Status"

if $HAS_CURL; then
  for domain in "https://${FRONTEND_HOST}" "https://www.${FRONTEND_HOST}"; do
    FE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$domain" 2>/dev/null || echo "000")
    if [[ "$FE_STATUS" == "200" || "$FE_STATUS" == "301" || "$FE_STATUS" == "302" ]]; then
      check_pass "Frontend (${domain}): HTTP ${FE_STATUS}"
    elif [[ "$FE_STATUS" == "000" ]]; then
      check_fail "Frontend (${domain}): Connection failed"
    else
      check_warn "Frontend (${domain}): HTTP ${FE_STATUS}"
    fi
  done
fi

# =============================================================================
# RESUMEN
# =============================================================================
print_header "Summary"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNED))
echo -e "  ${GREEN}Passed:${NC}   ${CHECKS_PASSED}/${TOTAL}"
echo -e "  ${RED}Failed:${NC}   ${CHECKS_FAILED}/${TOTAL}"
echo -e "  ${YELLOW}Warnings:${NC} ${CHECKS_WARNED}/${TOTAL}"
echo ""

if [[ $CHECKS_FAILED -eq 0 && $CHECKS_WARNED -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}All systems operational${NC}"
elif [[ $CHECKS_FAILED -eq 0 ]]; then
  echo -e "  ${YELLOW}${BOLD}System operational with warnings${NC}"
else
  echo -e "  ${RED}${BOLD}System issues detected${NC}"
fi

echo ""
exit $CHECKS_FAILED
