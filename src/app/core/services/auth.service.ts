import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError, catchError } from 'rxjs';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';
import { AuthResponse, LoginRequest, RefreshTokenRequest } from '../../models/interfaces/auth.model';

/**
 * Authentication service for handling login, logout, and token management.
 * 
 * NOTE: Primary auth state is managed by NgRx store. This service provides:
 * - HTTP calls for auth endpoints
 * - localStorage token/session management
 * - Token retrieval for interceptors
 * - isAuthenticated$ observable for backward compatibility
 * 
 * For auth state (user details, roles, etc.), prefer NgRx selectors from:
 * `src/app/store/selectors/auth.selectors.ts`
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL: string;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  // Local cache for quick synchronous access (e.g., for interceptors)
  private cachedUserData: AuthResponse | null = null;

  // Observable for authentication state (backward compatibility)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  /**
   * Observable that emits authentication state changes.
   * For more detailed auth state, prefer NgRx selectors.
   */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.API_URL = this.configService.getApiBaseUrl();
    this.loadCachedUserData();
    // Initialize auth state from cached data
    this.isAuthenticatedSubject.next(this.hasValidToken());
  }

  /**
   * Load user data from localStorage into memory cache
   */
  private loadCachedUserData(): void {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (userData) {
      try {
        this.cachedUserData = JSON.parse(userData);
      } catch (e) {
        this.cachedUserData = null;
      }
    }
  }

  /**
   * Login with email and password
   * @param credentials Login credentials
   * @returns Observable of auth response
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (isDevMode()) {
      console.log('AuthService: Login request for', credentials.email);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.API_URL}Auth`, credentials, { headers })
      .pipe(
        tap(response => {
          if (!response.token || !response.refreshToken) {
            throw new Error('Invalid server response: missing tokens');
          }
          this.setSession(response);
        }),
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  /**
   * Refresh the auth token using the refresh token
   * @returns Observable of auth response
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.http.post<AuthResponse>(`${this.API_URL}Auth/refresh`, refreshRequest, { headers })
      .pipe(
        tap(response => {
          if (isDevMode()) {
            console.log('AuthService: Token refreshed successfully');
          }
          this.setSession(response);
        }),
        catchError(error => {
          if (isDevMode()) {
            console.error('AuthService: Token refresh failed', error);
          }
          this.clearSession();
          return this.errorHandler.handleHttpError(error);
        })
      );
  }

  /**
   * Logout - clear all auth data
   */
  logout(): void {
    this.clearSession();
    if (isDevMode()) {
      console.log('AuthService: User logged out');
    }
  }

  /**
   * Get the current auth token (for interceptor use)
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get cached user data (for quick synchronous access)
   * For reactive access, use NgRx selectors instead.
   */
  getUserData(): AuthResponse | null {
    return this.cachedUserData;
  }

  /**
   * Check if user has a valid token in storage
   */
  hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return false;
    }

    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (!userData) {
      return false;
    }

    try {
      JSON.parse(userData);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Store session data in localStorage and cache
   */
  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refreshToken);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(authResult));
    this.cachedUserData = authResult;
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear all session data
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    this.cachedUserData = null;
    this.isAuthenticatedSubject.next(false);
  }
}
