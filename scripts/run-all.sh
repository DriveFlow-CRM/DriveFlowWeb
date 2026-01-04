#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

log() { printf "[run-all] %s\n" "$*"; }
warn() { printf "[run-all][warn] %s\n" "$*"; }
err() { printf "[run-all][error] %s\n" "$*" >&2; }

# 0) Check prerequisites and optionally install Docker if missing
if ! command -v docker >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    warn "Docker not found. Installing via apt-get -y ..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(. /etc/os-release; echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER" || true
    warn "Docker installed. You may need to re-login for group changes to take effect."
  else
    err "Docker not found and automatic install unsupported on this distro. Please install Docker and rerun."
    exit 1
  fi
fi

# 1) Load environment
if [ ! -f .env ]; then
  err ".env not found. Please copy from .env.sample and fill values."
  exit 1
fi
set -a; source .env; set +a

if [ -z "${FRONTEND_DOMAIN:-}" ]; then err "FRONTEND_DOMAIN is required in .env"; exit 1; fi
if [ -z "${LETSENCRYPT_EMAIL:-}" ]; then err "LETSENCRYPT_EMAIL is required in .env"; exit 1; fi
if [ -z "${BACKEND_URL:-}" ]; then
  warn "BACKEND_URL not set. Using sink http://127.0.0.1:9 to allow startup."
  export BACKEND_URL="http://127.0.0.1:9"
fi

# 2) Stop host nginx if running (free ports 80/443)
if systemctl is-active --quiet nginx; then
  warn "Stopping host nginx to free ports 80/443"
  sudo systemctl stop nginx || true
  sudo systemctl disable nginx || true
fi

# 3) Prepare directories and permissions
mkdir -p data/certbot/www data/certbot/conf
chmod +x scripts/*.sh || true

# 4) Build and start nginx in background (HTTP-only until certs exist)
log "Building image and starting nginx (detached) ..."
docker compose up -d --build nginx

# 5) Quick ACME reachability probe
echo ok-$(date +%s) > data/certbot/www/.well-known/acme-challenge/ping || true
log "Probing http://$FRONTEND_DOMAIN/.well-known/acme-challenge/ping"
curl -sI --max-time 10 "http://$FRONTEND_DOMAIN/.well-known/acme-challenge/ping" | sed -n '1,6p' || true

# 6) Issue staging cert then production cert
log "Issuing STAGING certificate (test) ..."
USE_STAGING=true scripts/init-cert.sh || warn "Staging issuance returned a non-zero code; continuing"

log "Issuing PRODUCTION certificate ..."
USE_STAGING=false scripts/init-cert.sh

# 7) Show certs and verify HTTPS
log "Listing cert directory ..."
ls -l "data/certbot/conf/live/$FRONTEND_DOMAIN" || true

log "Verifying HTTPS ..."
curl -I --max-time 20 "https://$FRONTEND_DOMAIN" | sed -n '1,12p' || true

log "All done. Docker is running in the background."


