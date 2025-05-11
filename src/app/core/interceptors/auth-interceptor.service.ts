import { Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const configService = inject(ConfigService);
  const apiBaseUrl = configService.getApiBaseUrl();

  // Skip auth header for public endpoints
  if (!request.url.startsWith(apiBaseUrl) ||
      request.url.includes('auth/login') ||
      request.url.includes('auth/refresh')) {
    return next(request);
    }

  const token = authService.getToken();
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(request, next, authService);
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
    return authService.refreshToken().pipe(
    switchMap(token => {
        return next(addToken(request, token.token));
      }),
    catchError(error => {
        authService.logout();
        return throwError(() => error);
      })
    );
}
