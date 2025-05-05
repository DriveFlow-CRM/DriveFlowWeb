import { Injectable } from '@angular/core';

/**
 * Configuration service that provides application-wide settings
 * This service abstracts environment-specific configurations
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // API Base URL - in a real environment this would come from environment variables
  // or be injected during the build process
  private readonly apiBaseUrl: string;

  constructor() {
    // In a production environment, this would be injected during build
    // For Angular applications, we can use build-time environment injection
    this.apiBaseUrl = this.getEnvironmentApiUrl();
    console.log('ConfigService initialized with API URL:', this.apiBaseUrl);
  }

  /**
   * Get the API base URL
   */
  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  /**
   * Get complete URL for a specific API endpoint
   */
  getApiUrl(endpoint: string): string {
    return `${this.apiBaseUrl}${endpoint}`;
  }

  /**
   * Get API URL from environment - using process.env variables
   * These are injected by webpack from .env locally or from Netlify environment variables in production
   */
  private getEnvironmentApiUrl(): string {
    // First try to get from process.env (injected by webpack)
    // @ts-ignore - process.env is available at runtime thanks to webpack.DefinePlugin
    const envUrl = typeof process !== 'undefined' && process.env && process.env.API_BASE_URL;

    if (envUrl) {
      return envUrl;
    }

    // Default development URL as fallback
    const defaultUrl = 'https://drive-flow-crm-api-cb1a9f783ea2.herokuapp.com/api/';
    return defaultUrl;
  }
}
