import { Injectable, isDevMode } from '@angular/core';

/**
 * Runtime configuration interface
 */
interface RuntimeConfig {
  apiBaseUrl?: string;
}

// Global window extension for runtime config
declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

/**
 * Configuration service that provides application-wide settings.
 * 
 * Configuration priority:
 * 1. Runtime config from window.__APP_CONFIG__ (set by deployment scripts)
 * 2. Default API URL
 * 
 * For deployments (Netlify, Docker, etc.), set window.__APP_CONFIG__ before 
 * Angular bootstraps, or use the config.json approach.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly apiBaseUrl: string;
  private readonly DEFAULT_API_URL = 'https://api.driveflow.dpdns.org/api/';

  constructor() {
    this.apiBaseUrl = this.getEnvironmentApiUrl();
    if (isDevMode()) {
      console.log('ConfigService initialized with API URL:', this.apiBaseUrl);
    }
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
   * Get API URL from environment
   * Checks window.__APP_CONFIG__ for runtime configuration
   */
  private getEnvironmentApiUrl(): string {
    // Check runtime config (set via index.html script or environment injection)
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.apiBaseUrl) {
      return window.__APP_CONFIG__.apiBaseUrl;
    }

    return this.DEFAULT_API_URL;
  }
}
