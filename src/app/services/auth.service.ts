import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, catchError } from 'rxjs';
import { ConfigService } from './config.service';

// Matches LoginDto from API
export interface LoginRequest {
  email: string;
  password: string;
}

// Matches RefreshDto from API
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Actual response structure from API auth endpoints
export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  userType: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  userPhone: string;
  schoolId: number;
}

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
    private configService: ConfigService
  ) {
    this.API_URL = this.configService.getApiBaseUrl();
    this.checkAuthStatus();
    this.loadUserData();
  }

  private checkAuthStatus(): void {
    const isValid = this.hasValidToken();
    this.isAuthenticatedSubject.next(isValid);
    if (!isValid) {
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
        }),
        catchError(error => {
          console.error('Login error:', error);

          let errorMessage = 'An unexpected error occurred';

          if (error.status === 401) {
            errorMessage = 'Email or password incorrect';
          } else if (error.status === 404) {
            errorMessage = 'Account not found';
          } else if (error.status === 0) {
            errorMessage = 'Cannot connect to the server. This may be due to CORS restrictions or the server being offline.';

            // Suggest solutions for CORS issues
            console.warn(
              'This is likely a CORS issue. Try:\n' +
              '1. Using a CORS browser extension like "CORS Unblock"\n' +
              '2. For development, start Chrome with --disable-web-security flag\n' +
              '3. Contact API administrator to enable CORS for this origin'
            );
          }

          return throwError(() => new Error(errorMessage));
        })
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

    return this.http.post<AuthResponse>(`${this.API_URL}Auth/refresh`, { refreshToken }, { headers })
      .pipe(
        tap(response => {
          console.log('Token refresh response:', response);
          this.setSession(response);
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
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
