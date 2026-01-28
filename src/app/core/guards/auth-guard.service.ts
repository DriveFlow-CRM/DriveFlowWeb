import { Injectable, inject, isDevMode } from '@angular/core';
import { CanActivate, Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { selectIsAuthenticated } from '../../store/selectors/auth.selectors';
import { AppState } from '../../store/reducers';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  private lastNavigationTime = 0;
  private navigationThreshold = 500; // minimum ms between navigations

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Prevent rapid multiple navigations
    const now = Date.now();
    if (now - this.lastNavigationTime < this.navigationThreshold) {
      if (isDevMode()) {
        console.log('AuthGuard: preventing rapid redirects');
      }
      return of(true);
    }

    // First check localStorage for quick sync check (handles page refresh)
    if (this.authService.hasValidToken()) {
      return of(true);
    }

    // Then check NgRx store state
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        if (isDevMode()) {
          console.log('AuthGuard: isAuthenticated =', isAuthenticated, 'URL:', state.url);
        }

        if (isAuthenticated) {
          return true;
        }

        // Don't redirect to auth if we're already there
        if (!state.url.includes('/auth')) {
          if (isDevMode()) {
            console.log('AuthGuard: not authenticated, redirecting to /auth');
          }
          this.lastNavigationTime = Date.now();
          this.router.navigate(['/auth'], {
            queryParams: { returnUrl: state.url },
            replaceUrl: true
          });
        }

        return false;
      })
    );
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuardService).canActivate(route, state);
};
