#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "${ACCOUNTANT_DOMAIN:-}" ]; then
  echo "ACCOUNTANT_DOMAIN is required in .env" >&2
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

echo "Starting nginx for accountant ACME challenge..."
docker compose up -d nginx

echo "Requesting Let's Encrypt certificate for ${ACCOUNTANT_DOMAIN}..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${ACCOUNTANT_DOMAIN}" \
  --email "${LETSENCRYPT_EMAIL}" --agree-tos --no-eff-email --non-interactive ${STAGING_FLAG}

echo "Restarting nginx to enable accountant HTTPS..."
docker compose restart nginx

echo "Done. Visit https://${ACCOUNTANT_DOMAIN}"



