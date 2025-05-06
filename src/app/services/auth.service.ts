import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, catchError } from 'rxjs';
import { ConfigService } from './config.service';
import { Router } from '@angular/router';

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
    private configService: ConfigService,
    private router: Router
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

          // Get the path for the specific dashboard based on user role
          const userRole = response.userType;
          let dashboardPath = '/auth'; // Default fallback

          switch (userRole) {
            case 'SuperAdmin':
              dashboardPath = '/dashboard/super-admin';
              break;
            case 'SchoolAdmin':
              dashboardPath = '/dashboard/school-admin';
              break;
            case 'Instructor':
              dashboardPath = '/dashboard/instructor';
              break;
            case 'Student':
              dashboardPath = '/dashboard/student';
              break;
            default:
              console.warn(`Unknown user role: ${userRole}, using default route`);
          }

          // Remove setTimeout and use navigate with a promise to handle errors
          console.log('Navigating to:', dashboardPath);
          this.router.navigate([dashboardPath]).catch(navError => {
            console.error('Navigation error:', navError);
          });
        }),
        catchError(error => {
          console.error('Login error:', error);

          let errorMessage = 'An unexpected error occurred';

          if (error.status === 401) {
            errorMessage = 'Email or password incorrect';
          } else if (error.status === 404) {
            errorMessage = 'Account not found';
          } else if (error.status === 0) {
            errorMessage = 'Cannot connect to the server. Please check your internet connection or try again later.';

            // Log CORS debugging information
            console.warn(
              'This might be a CORS issue. Server details:',
              'API URL:', this.API_URL,
              'Request headers:', headers
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
