import { HttpErrorResponse, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, catchError, switchMap, filter, take } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

// State for the interceptor
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const configService = inject(ConfigService);
  const apiBaseUrl = configService.getApiBaseUrl();

  // Only add auth header for API requests
  if (!req.url.includes(apiBaseUrl)) {
    return next(req);
  }

  // Add CORS headers to help with cross-origin requests
  let modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const token = authService.getToken();

  if (token) {
    modifiedReq = addToken(modifiedReq, token);
  }

  return next(modifiedReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        console.log(`HTTP error: ${error.status} for URL: ${req.url}`);

        if (error.status === 401) {
          // Don't try to refresh token for auth endpoints
          if (!req.url.includes(`${apiBaseUrl}Auth`)) {
            return handle401Error(modifiedReq, next, authService);
          } else {
            console.log('Auth endpoint returned 401 - not refreshing token');
            return throwError(() => error);
          }
        } else if (error.status === 0) {
          // CORS error or network issue
          console.error('Network error in interceptor:', error);
          console.error('Request details:', {
            url: req.url,
            method: req.method,
            headers: modifiedReq.headers
          });
        }
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Check if we have a refresh token before trying to refresh
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('Authentication required'));
    }

    return authService.refreshToken().pipe(
      switchMap((token) => {
        isRefreshing = false;
        refreshTokenSubject.next(token.token);
        return next(addToken(request, token.token));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token as string));
      })
    );
  }
}
