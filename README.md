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

## Installation

Follow these steps to set up the project locally:

```bash
# Clone the repository
git clone https://github.com/DriveFlow-CRM/DriveFlowWeb.git

# Navigate to the project directory
cd DriveFlowWeb

# Install dependencies
npm install

# Set up environment variables
cp sample.env .env
# Edit .env file with your actual API URL and other configurations

# Start the development server
ng serve
```

Access the application by opening your browser and navigating to `http://localhost:4200/`.

## Environment Variables

DriveFlow uses environment variables for configuration. These are loaded from a `.env` file in the project root.

### Required Variables
- `API_BASE_URL`: Base URL for the DriveFlow API (e.g., `https://api.driveflow.com/api/`)

### Setting Up Environment Variables
1. Copy the sample environment file: `cp sample.env .env`
2. Edit the `.env` file with your actual values
3. Restart the development server if it's already running

⚠️ **Note**: Never commit the `.env` file to version control as it may contain sensitive information. The `.env` file is already added to `.gitignore`.

## Deployment

To build the application for production:

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to your hosting provider of choice.
