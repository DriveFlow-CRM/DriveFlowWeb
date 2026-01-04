#!/usr/bin/env bash
set -euo pipefail

# Load env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "${FRONTEND_DOMAIN:-}" ]; then
  echo "FRONTEND_DOMAIN is required in .env" >&2
  exit 1
fi
if [ -z "${LETSENCRYPT_EMAIL:-}" ]; then
  echo "LETSENCRYPT_EMAIL is required in .env" >&2
  exit 1
fi

STAGING_FLAG=""
if [ "${USE_STAGING:-false}" = "true" ]; then
  STAGING_FLAG="--staging"
fi

mkdir -p ./data/certbot/www ./data/certbot/conf

echo "Starting nginx (HTTP-only) to serve ACME challenges..."
docker compose up -d nginx

echo "Requesting Let's Encrypt certificate for ${FRONTEND_DOMAIN}..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${FRONTEND_DOMAIN}" \
  --email "${LETSENCRYPT_EMAIL}" --agree-tos --no-eff-email --non-interactive ${STAGING_FLAG}

echo "Certificate request finished. Restarting nginx to enable HTTPS..."
docker compose restart nginx

echo "Done. Visit https://${FRONTEND_DOMAIN}"


