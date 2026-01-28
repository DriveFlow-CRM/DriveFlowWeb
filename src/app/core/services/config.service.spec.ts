import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  const DEFAULT_API_URL = 'https://api.driveflow.dpdns.org/api/';

  beforeEach(() => {
    // Clear any runtime config
    delete (window as any).__APP_CONFIG__;

    TestBed.configureTestingModule({
      providers: [ConfigService]
    });
  });

  describe('with default configuration', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return default API URL when no runtime config', () => {
      expect(service.getApiBaseUrl()).toBe(DEFAULT_API_URL);
    });

    it('should build complete endpoint URL', () => {
      const endpoint = 'users/123';
      const expectedUrl = `${DEFAULT_API_URL}${endpoint}`;

      expect(service.getApiUrl(endpoint)).toBe(expectedUrl);
    });

    it('should handle empty endpoint', () => {
      expect(service.getApiUrl('')).toBe(DEFAULT_API_URL);
    });

    it('should handle endpoint with leading slash', () => {
      const endpoint = '/users';
      expect(service.getApiUrl(endpoint)).toBe(`${DEFAULT_API_URL}${endpoint}`);
    });
  });

  describe('with runtime configuration', () => {
    const customApiUrl = 'https://custom-api.example.com/api/';

    beforeEach(() => {
      // Set runtime config before creating service
      (window as any).__APP_CONFIG__ = {
        apiBaseUrl: customApiUrl
      };

      // Need to reset TestBed to get fresh instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ConfigService]
      });

      service = TestBed.inject(ConfigService);
    });

    afterEach(() => {
      delete (window as any).__APP_CONFIG__;
    });

    it('should use runtime config API URL when available', () => {
      expect(service.getApiBaseUrl()).toBe(customApiUrl);
    });

    it('should build endpoint URL with runtime config base', () => {
      const endpoint = 'auth/login';
      expect(service.getApiUrl(endpoint)).toBe(`${customApiUrl}${endpoint}`);
    });
  });

  describe('with partial runtime configuration', () => {
    beforeEach(() => {
      // Set runtime config without apiBaseUrl
      (window as any).__APP_CONFIG__ = {};

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ConfigService]
      });

      service = TestBed.inject(ConfigService);
    });

    afterEach(() => {
      delete (window as any).__APP_CONFIG__;
    });

    it('should fall back to default when runtime config has no apiBaseUrl', () => {
      expect(service.getApiBaseUrl()).toBe(DEFAULT_API_URL);
    });
  });

  describe('URL building', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should handle various endpoint formats', () => {
      const testCases = [
        { endpoint: 'users', expected: `${DEFAULT_API_URL}users` },
        { endpoint: 'users/1/files', expected: `${DEFAULT_API_URL}users/1/files` },
        { endpoint: 'Auth', expected: `${DEFAULT_API_URL}Auth` },
        { endpoint: 'student/123/stats/mistakes', expected: `${DEFAULT_API_URL}student/123/stats/mistakes` }
      ];

      testCases.forEach(({ endpoint, expected }) => {
        expect(service.getApiUrl(endpoint)).toBe(expected);
      });
    });
  });
});
