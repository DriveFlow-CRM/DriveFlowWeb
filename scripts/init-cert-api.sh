#!/usr/bin/env bash
set -euo pipefail

# Load env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "${API_DOMAIN:-}" ]; then
  echo "API_DOMAIN is required in .env" >&2
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

echo "Starting nginx to serve ACME challenges for API domain..."
docker compose up -d nginx

echo "Requesting Let's Encrypt certificate for ${API_DOMAIN}..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${API_DOMAIN}" \
  --email "${LETSENCRYPT_EMAIL}" --agree-tos --no-eff-email --non-interactive ${STAGING_FLAG}

echo "Restarting nginx to enable API HTTPS..."
docker compose restart nginx

echo "Done. Visit https://${API_DOMAIN}"




