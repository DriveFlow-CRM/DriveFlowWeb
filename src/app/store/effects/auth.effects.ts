import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    switchMap(({ email, password }) =>
      this.authService.login({ email, password }).pipe(
        map(response => AuthActions.loginSuccess({
          user: {
            userId: response.userId,
            userType: response.userType,
            userEmail: response.userEmail,
            firstName: response.firstName,
            lastName: response.lastName,
            userPhone: response.userPhone,
            schoolId: response.schoolId
          },
          token: response.token,
          refreshToken: response.refreshToken
        })),
        catchError(error => of(AuthActions.loginFailure({ error: error.message })))
      )
    )
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(() => {
      // Navigate to the dashboard route, the auth service will handle token storage
      this.router.navigate(['/dashboard']);
    })
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => {
      this.authService.logout();
      this.router.navigate(['/auth']);
    }),
    map(() => AuthActions.logoutSuccess())
  ));

  checkAuth$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.checkAuthStatus),
    map(() => {
      const userData = this.authService.getUserData();
      const isAuthenticated = !!userData && this.authService.getToken() !== null;

      return AuthActions.authStatusChecked({
        isAuthenticated,
        user: userData ? {
          userId: userData.userId,
          userType: userData.userType,
          userEmail: userData.userEmail,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userPhone: userData.userPhone,
          schoolId: userData.schoolId
        } : null
      });
    })
  ));

  refreshToken$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.refreshToken),
    switchMap(() =>
      this.authService.refreshToken().pipe(
        map(response => AuthActions.refreshTokenSuccess({
          token: response.token,
          refreshToken: response.refreshToken
        })),
        catchError(error => of(AuthActions.refreshTokenFailure({ error: error.message })))
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}
}
