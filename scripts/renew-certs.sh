#!/usr/bin/env bash
set -euo pipefail

# Optional staging for dry run
STAGING_FLAG=""
if [ "${USE_STAGING:-false}" = "true" ]; then
  STAGING_FLAG="--dry-run"
fi

echo "Renewing certificates (may be no-op if not due)..."
docker compose run --rm certbot renew ${STAGING_FLAG}

echo "Reloading nginx to pick up renewed certs..."
docker compose exec nginx nginx -s reload || docker compose restart nginx

echo "Renewal step complete."


