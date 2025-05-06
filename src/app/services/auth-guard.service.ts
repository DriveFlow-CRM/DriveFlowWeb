import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('AuthGuard checking access to:', state.url);

    // Check if we already have a token in localStorage
    const token = localStorage.getItem('auth_token');
    console.log('Token exists:', !!token);

    return this.authService.isAuthenticated$.pipe(
      take(1),
      tap(isAuthenticated => {
        console.log('Auth state from service:', isAuthenticated);
      }),
      map(isAuthenticated => {
        if (isAuthenticated) {
          console.log('Access granted to:', state.url);
          return true;
        }

        // Store the attempted URL for redirecting
        const returnUrl = state.url;
        console.log('Access denied, redirecting to /auth with returnUrl:', returnUrl);
        this.router.navigate(['/auth'], { queryParams: { returnUrl } });
        return false;
      })
    );
  }
}

// For use with the new functional guards in Angular
export const authGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(AuthGuardService).canActivate(next, state);
};
