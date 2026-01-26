import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';
import { AuthResponse, LoginRequest } from '../../models/interfaces/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let configServiceMock: jest.Mocked<ConfigService>;
  let errorHandlerMock: jest.Mocked<ErrorHandlerService>;

  const mockApiUrl = 'https://api.test.com/api/';

  const mockAuthResponse: AuthResponse = {
    token: 'test-token-123',
    refreshToken: 'test-refresh-token-456',
    expiresIn: 3600,
    userId: 'user-1',
    userType: 'Student',
    userEmail: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    userPhone: '+40123456789',
    schoolId: 1
  };

  beforeEach(() => {
    // Clear localStorage mock
    (localStorage.getItem as jest.Mock).mockReset();
    (localStorage.setItem as jest.Mock).mockReset();
    (localStorage.removeItem as jest.Mock).mockReset();

    // Create mocks
    configServiceMock = {
      getApiBaseUrl: jest.fn().mockReturnValue(mockApiUrl),
      getApiUrl: jest.fn()
    } as unknown as jest.Mocked<ConfigService>;

    errorHandlerMock = {
      handleHttpError: jest.fn().mockImplementation(error => {
        throw error;
      })
    } as unknown as jest.Mocked<ErrorHandlerService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with API URL from ConfigService', () => {
      expect(configServiceMock.getApiBaseUrl).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginCredentials: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login and store tokens', (done) => {
      service.login(loginCredentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockAuthResponse.token);
          expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refreshToken);
          expect(localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockAuthResponse));
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}Auth`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginCredentials);
      req.flush(mockAuthResponse);
    });

    it('should set isAuthenticated to true after successful login', (done) => {
      let authState = false;
      service.isAuthenticated$.subscribe(state => {
        authState = state;
      });

      service.login(loginCredentials).subscribe({
        next: () => {
          expect(authState).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}Auth`);
      req.flush(mockAuthResponse);
    });

    it('should throw error when response is missing tokens', (done) => {
      const invalidResponse = { ...mockAuthResponse, token: '', refreshToken: '' };

      service.login(loginCredentials).subscribe({
        error: (error) => {
          expect(error.message).toContain('missing tokens');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}Auth`);
      req.flush(invalidResponse);
    });

    it('should handle HTTP errors', (done) => {
      errorHandlerMock.handleHttpError.mockImplementation(() => {
        throw new Error('Network error');
      });

      service.login(loginCredentials).subscribe({
        error: (error) => {
          expect(error.message).toBe('Network error');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}Auth`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('logout', () => {
    it('should clear all session data from localStorage', () => {
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
    });

    it('should set isAuthenticated to false', (done) => {
      service.logout();

      service.isAuthenticated$.subscribe(state => {
        expect(state).toBe(false);
        done();
      });
    });

    it('should clear cached user data', () => {
      service.logout();
      expect(service.getUserData()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('stored-token');

      const token = service.getToken();

      expect(token).toBe('stored-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return null when no token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const token = service.getToken();

      expect(token).toBeNull();
    });
  });

  describe('getUserData', () => {
    it('should return cached user data', () => {
      // First login to cache the data
      const loginCredentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(loginCredentials).subscribe();

      const req = httpMock.expectOne(`${mockApiUrl}Auth`);
      req.flush(mockAuthResponse);

      const userData = service.getUserData();
      expect(userData).toEqual(mockAuthResponse);
    });

    it('should return null when not logged in', () => {
      const userData = service.getUserData();
      expect(userData).toBeNull();
    });
  });

  describe('hasValidToken', () => {
    it('should return true when token and valid user data exist', () => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'valid-token';
        if (key === 'user_data') return JSON.stringify(mockAuthResponse);
        return null;
      });

      // Need to create a new instance to test initialization
      const newService = new AuthService(
        TestBed.inject(HttpTestingController) as any,
        configServiceMock,
        errorHandlerMock
      );

      expect(newService.hasValidToken()).toBe(true);
    });

    it('should return false when no token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(service.hasValidToken()).toBe(false);
    });

    it('should return false when user data is invalid JSON', () => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'valid-token';
        if (key === 'user_data') return 'invalid-json';
        return null;
      });

      expect(service.hasValidToken()).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', (done) => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'refresh_token') return 'old-refresh-token';
        return null;
      });

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockAuthResponse.token);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}Auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush(mockAuthResponse);
    });

    it('should throw error when no refresh token available', (done) => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.message).toBe('No refresh token available');
          done();
        }
      });
    });

    it('should clear session on refresh failure', (done) => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'refresh_token') return 'old-refresh-token';
        return null;
      });

      errorHandlerMock.handleHttpError.mockImplementation(() => {
        throw new Error('Refresh failed');
      });

      service.refreshToken().subscribe({
        error: () => {
          expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
          expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
          expect(localStorage.removeItem).toHaveBeenCalledWith('user_data');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}Auth/refresh`);
      req.flush('Error', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('isAuthenticated$', () => {
    it('should emit false initially when no valid token', (done) => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      service.isAuthenticated$.subscribe(state => {
        expect(state).toBe(false);
        done();
      });
    });
  });
});
