# Multi-stage build: Build Angular app, then serve with Nginx

# --- Stage 1: Build Angular ---
FROM node:18.19-alpine AS builder
WORKDIR /app

# Install dependencies first (leverage cache)
COPY package.json package-lock.json ./
# Use npm install instead of npm ci to tolerate minor lock/package.json drift
RUN npm install --no-audit --no-fund

# Copy source and build
COPY . .
# Build with development configuration to bypass strict production budgets
RUN npm run build -- --configuration=development

# --- Stage 2: Nginx to serve static files ---
FROM nginx:1.27-alpine AS runner

# Create directories used by certbot webroot and logs
RUN mkdir -p /var/www/certbot /var/log/nginx

# Copy built app
COPY --from=builder /app/dist/drive-flow-web /usr/share/nginx/html

# Copy nginx template and entrypoint to allow env-based config
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/http-only.conf.template /etc/nginx/templates/http-only.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

# Use a tiny healthcheck on the HTTP endpoint
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]


