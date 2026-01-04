# DriveFlow CRM for Driving Schools

![DriveFlow Logo](src/assets/images/logo/logo-extended-plus.svg)

## Overview

DriveFlow is a modern Customer Relationship Management (CRM) system specifically designed for driving schools. This Angular-based web application serves as the frontend interface for the comprehensive DriveFlow CRM platform, providing an intuitive and responsive user experience for managing driving school operations.

## Key Features

- **Student Appointment Management**: Efficiently organize and schedule driving lessons and examinations
- **Instructor Time Management**: Optimize instructor schedules to maximize productivity and availability
- **Financial Data & Analytics**: Access detailed reports and statistics for tracking performance and revenue
- **Document Expiration Tracking**: Monitor validity periods for vehicle and student documentation
- **Lead Management**: Track and manage potential student inquiries and conversion rates
- **Modern Responsive Interface**: Clean, intuitive design that works seamlessly across all devices

## Technology Stack

- **Frontend Framework**: Angular 17.3.0
- **CSS Framework**: Tailwind CSS 3.3.5
- **Programming Language**: TypeScript 5.2.2
- **Package Manager**: npm 10.2.4
- **Build Tools**: Angular CLI 17.3.0
- **Styling Preprocessor**: PostCSS 8.4.31 with Autoprefixer 10.4.16
- **State Management**: NgRx 17.0.1

## Installation & Setup

Follow these steps to set up the project for development:

```bash
# Clone the repository
git clone https://github.com/DriveFlow-CRM/DriveFlowWeb.git

# Navigate to the project directory
cd DriveFlowWeb

# Install dependencies
npm install

# Start the development server
ng serve
```

Access the application by opening your browser and navigating to `http://localhost:4200/`.

## Development

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Coding Standards

This project follows a comprehensive set of coding standards designed to ensure consistency and maintainability. Please refer to the [Coding Standards](src/CODING_STANDARDS.md) document for detailed guidelines on:

- Project structure
- Routing standards
- Authentication implementation
- Component organization
- Styling approach (Tailwind CSS + Angular Material)
- State management with NgRx
- Error handling
- Data models

All contributors should review and follow these standards when working on the project.

## Building for Production

### Build

Run the following command to build the project for production:

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory and are ready for deployment.

### Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice.

## Deployment

The application is configured for easy deployment to various platforms:

### Static Hosting (Netlify, Vercel, Firebase)

The built application can be deployed to any static hosting provider:

1. Build the application: `ng build --configuration production`
2. Deploy the contents of the `dist/` directory to your hosting provider

### Heroku

To deploy to Heroku:

1. Install the Heroku CLI: `npm install -g heroku`
2. Log in to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Deploy: `git push heroku main`

## Configuration

API endpoints and other configuration settings are managed through the ConfigService, which handles environment-specific settings. The application is pre-configured to connect to the production API.

## License

## Dockerized Deployment (Nginx + HTTPS via Certbot)

This repository includes a production-ready Docker setup to build the Angular app, serve it via Nginx, and enable HTTPS with Let’s Encrypt (Certbot). It follows the well-known Nginx + Certbot Compose pattern where Nginx serves the ACME challenge and then uses the generated certificates. See the related issue for context and requirements: [DriveFlowWeb Issue #3](https://github.com/DriveFlow-CRM/DriveFlowWeb/issues/3#issue-3578177443).

### Prerequisites

- A VPS or server with a public IPv4
- DNS A record pointing `FRONTEND_DOMAIN` to your server’s IP
- Docker and Docker Compose installed
- Open ports: 80 (HTTP) and 443 (HTTPS) on your firewall/security group

### Files added

- `Dockerfile`: Multi-stage build (Node to build Angular → Nginx to serve)
- `docker-compose.yml`: Nginx service and a Certbot utility service sharing volumes
- `nginx/default.conf.template`: HTTPS config (rendered via environment variables)
- `nginx/http-only.conf.template`: HTTP-only config (used before certs exist)
- `docker/entrypoint.sh`: Renders the appropriate Nginx config at container start
- `scripts/init-cert.sh`: One-time helper to obtain the initial certificate
- `scripts/renew-certs.sh`: Helper to renew and reload Nginx

### Environment variables

Create a `.env` file in the project root. Use the following keys:

```
FRONTEND_DOMAIN=app.example.com
BACKEND_URL=https://api.example.com
LETSENCRYPT_EMAIL=admin@example.com
USE_STAGING=false
```

- `FRONTEND_DOMAIN`: Your site’s domain (must resolve to this server)
- `BACKEND_URL`: Backend API base URL; Nginx proxies `/api/*` to this URL
- `LETSENCRYPT_EMAIL`: Email for Let’s Encrypt registration and expiry notices
- `USE_STAGING`: Use `true` for test certificates, `false` for production

You may also keep a `.env.sample` file with the same keys for reference.

### Build and run (first time)

1) Build image and start Nginx (HTTP-only will be used until certs exist):

```bash
docker compose up -d --build nginx
```

2) Obtain the Let’s Encrypt certificate (make sure DNS is set and port 80 is reachable):

```bash
# Staging (safe test)
USE_STAGING=true ./scripts/init-cert.sh

# Production (real certificate)
USE_STAGING=false ./scripts/init-cert.sh
```

This script requests the certificate into `./data/certbot/conf`, then restarts Nginx.

3) Verify HTTPS:

```bash
curl -I https://$FRONTEND_DOMAIN
```

### Renewals

Let’s Encrypt certificates are valid for 90 days. Renew with:

```bash
./scripts/renew-certs.sh
```

For unattended renewal, set up a cron on the host (runs daily):

```cron
0 3 * * * cd /path/to/DriveFlowWeb && ./scripts/renew-certs.sh >> /var/log/driveflowweb-renew.log 2>&1
```

### Notes
- Deployment quick commands (no explanations)

Fresh clone
```bash
cp .env.sample .env && nano .env
./scripts/run-all.sh
```

After pulling updates
```bash
docker compose up -d --build nginx
```

Server restarted
```bash
docker compose up -d nginx
docker compose ps
```

Domain changed
```bash
nano .env   # update FRONTEND_DOMAIN
docker compose up -d --build nginx
USE_STAGING=false ./scripts/init-cert.sh
```

Manual renew (cron-safe)
```bash
./scripts/renew-certs.sh
```

- The Nginx config serves the Angular build from `/usr/share/nginx/html` and provides SPA routing via `try_files`.
- Requests to `/api/*` are reverse-proxied to `BACKEND_URL`. You can remove or change this behavior in `nginx/*.template`.
- Configuration is injected using environment variables and `envsubst` at container start (Nginx does not natively interpolate env vars in configs; this is the recommended approach).


This project is licensed under the MIT License - see the LICENSE file for details.
