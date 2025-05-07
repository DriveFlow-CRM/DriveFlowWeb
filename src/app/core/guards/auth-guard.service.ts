import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  private lastNavigationTime = 0;
  private navigationThreshold = 500; // minimum ms between navigations

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Prevent rapid multiple navigations
    const now = Date.now();
    if (now - this.lastNavigationTime < this.navigationThreshold) {
      console.log('Auth guard - preventing rapid redirects');
      return new Observable<boolean>(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        console.log('Auth guard - isAuthenticated:', isAuthenticated, 'URL:', state.url);

        if (isAuthenticated) {
          return true;
        }

        // Don't redirect to auth if we're already there
        if (!state.url.includes('/auth')) {
          console.log('Not authenticated, redirecting to auth');
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
