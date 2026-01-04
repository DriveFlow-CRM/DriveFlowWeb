#!/bin/sh
set -e

# Render appropriate nginx config. If certs exist, use HTTPS template; otherwise, HTTP-only template.
HTTPS_TEMPLATE="/etc/nginx/templates/default.conf.template"
HTTP_TEMPLATE="/etc/nginx/templates/http-only.conf.template"
API_HTTPS_TEMPLATE="/etc/nginx/templates/api-https.conf.template"
API_HTTP_TEMPLATE="/etc/nginx/templates/api-http-only.conf.template"
ACCOUNTANT_HTTPS_TEMPLATE="/etc/nginx/templates/accountant-https.conf.template"
ACCOUNTANT_HTTP_TEMPLATE="/etc/nginx/templates/accountant-http-only.conf.template"
TARGET="/etc/nginx/conf.d/default.conf"
API_TARGET="/etc/nginx/conf.d/api.conf"
ACCOUNTANT_TARGET="/etc/nginx/conf.d/accountant.conf"

: ${FRONTEND_DOMAIN:="_"}
: ${BACKEND_URL:="http://backend:8080"}
: ${API_DOMAIN:=""}
: ${API_UPSTREAM:="http://host.docker.internal:8080"}
: ${ACCOUNTANT_DOMAIN:=""}
: ${ACCOUNTANT_UPSTREAM:="http://host.docker.internal:5001"}

CERT_PATH="/etc/letsencrypt/live/${FRONTEND_DOMAIN}/fullchain.pem"
if [ -f "$CERT_PATH" ] && [ -f "$HTTPS_TEMPLATE" ]; then
  echo "[entrypoint] Certificates found. Rendering HTTPS nginx config."
  envsubst '${FRONTEND_DOMAIN} ${BACKEND_URL}' < "$HTTPS_TEMPLATE" > "$TARGET"
else
  echo "[entrypoint] Certificates not found. Rendering HTTP-only nginx config."
  if [ -f "$HTTP_TEMPLATE" ]; then
    envsubst '${FRONTEND_DOMAIN} ${BACKEND_URL}' < "$HTTP_TEMPLATE" > "$TARGET"
  else
    # Fallback to HTTPS template if HTTP-only is missing
    envsubst '${FRONTEND_DOMAIN} ${BACKEND_URL}' < "$HTTPS_TEMPLATE" > "$TARGET"
  fi
fi

# Ensure ACME webroot exists
mkdir -p /var/www/certbot/.well-known/acme-challenge

# Render API virtual host if API_DOMAIN is provided
if [ -n "$API_DOMAIN" ]; then
  API_CERT_PATH="/etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem"
  if [ -f "$API_CERT_PATH" ] && [ -f "$API_HTTPS_TEMPLATE" ]; then
    echo "[entrypoint] API cert found. Rendering API HTTPS nginx config."
    envsubst '${API_DOMAIN} ${API_UPSTREAM}' < "$API_HTTPS_TEMPLATE" > "$API_TARGET"
  else
    echo "[entrypoint] API cert not found. Rendering API HTTP-only nginx config."
    if [ -f "$API_HTTP_TEMPLATE" ]; then
      envsubst '${API_DOMAIN} ${API_UPSTREAM}' < "$API_HTTP_TEMPLATE" > "$API_TARGET"
    fi
  fi
fi

# Render accountant virtual host if ACCOUNTANT_DOMAIN is provided
if [ -n "$ACCOUNTANT_DOMAIN" ]; then
  ACCOUNTANT_CERT_PATH="/etc/letsencrypt/live/${ACCOUNTANT_DOMAIN}/fullchain.pem"
  if [ -f "$ACCOUNTANT_CERT_PATH" ] && [ -f "$ACCOUNTANT_HTTPS_TEMPLATE" ]; then
    echo "[entrypoint] Accountant cert found. Rendering accountant HTTPS nginx config."
    envsubst '${ACCOUNTANT_DOMAIN} ${ACCOUNTANT_UPSTREAM}' < "$ACCOUNTANT_HTTPS_TEMPLATE" > "$ACCOUNTANT_TARGET"
  else
    echo "[entrypoint] Accountant cert not found. Rendering accountant HTTP-only nginx config."
    if [ -f "$ACCOUNTANT_HTTP_TEMPLATE" ]; then
      envsubst '${ACCOUNTANT_DOMAIN} ${ACCOUNTANT_UPSTREAM}' < "$ACCOUNTANT_HTTP_TEMPLATE" > "$ACCOUNTANT_TARGET"
    fi
  fi
fi

exec "$@"


