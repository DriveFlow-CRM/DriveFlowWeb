import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, catchError } from 'rxjs';
import { ConfigService } from './config.service';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';
import { AuthResponse, LoginRequest, RefreshTokenRequest } from '../../models/interfaces/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL: string;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userData: AuthResponse | null = null;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.API_URL = this.configService.getApiBaseUrl();
    this.checkAuthStatus();
    this.loadUserData();
  }

  private checkAuthStatus(): void {
    console.log('Checking auth status');

    const token = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_DATA_KEY);

    console.log('Token exists:', !!token);
    console.log('Refresh token exists:', !!refreshToken);
    console.log('User data exists:', !!userData);

    const isValid = this.hasValidToken();
    console.log('Token is valid:', isValid);

    this.isAuthenticatedSubject.next(isValid);

    // Only clear data if we're actually logged in but have invalid tokens
    if (!isValid && (token || refreshToken)) {
      console.log('Invalid token found, clearing auth state');
      this.logout();
    }
  }

  private loadUserData(): void {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (userData) {
      this.userData = JSON.parse(userData);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Login request:', credentials);

    // Set appropriate headers for CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.API_URL}Auth`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('Login response:', response);

          // Make sure we received a valid token and refreshToken
          if (!response.token || !response.refreshToken) {
            console.error('Invalid login response: missing token or refreshToken');
            throw new Error('Server returned an invalid response');
          }

          this.setSession(response);

          // No navigation here - let the component handle it
        }),
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // Set appropriate headers for CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.http.post<AuthResponse>(`${this.API_URL}Auth/refresh`, refreshRequest, { headers })
      .pipe(
        tap(response => {
          console.log('Token refresh response:', response);
          this.setSession(response);
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return this.errorHandler.handleHttpError(error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    this.userData = null;
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserData(): AuthResponse | null {
    return this.userData;
  }

  private setSession(authResult: AuthResponse): void {
    // Log what's being saved to localStorage for debugging
    console.log('Saving to localStorage:', {
      token: !!authResult.token,
      refreshToken: !!authResult.refreshToken,
      userData: !!authResult
    });

    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refreshToken);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(authResult));
    this.userData = authResult;
    this.isAuthenticatedSubject.next(true);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return false;
    }

    // We could check expiration from the JWT, but using the stored user data is more reliable
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        // We don't have an explicit expiration date in the stored data, so we'll trust the token for now
        return true;
      } catch (e) {
        return false;
      }
    }

    return false;
  }
}
