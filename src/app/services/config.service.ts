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
    console.log('ConfigService initialized');
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
   * Get API URL from environment - this is a placeholder for the actual implementation
   * In a real application, this would use build-time configuration
   */
  private getEnvironmentApiUrl(): string {
    // Default development URL
    const defaultUrl = 'https://drive-flow-crm-api-cb1a9f783ea2.herokuapp.com/api/';

    // In Angular, environment variables would be injected at build time
    // This is a placeholder implementation
    return defaultUrl;
  }
}
