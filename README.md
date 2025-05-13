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

This project is licensed under the MIT License - see the LICENSE file for details.
