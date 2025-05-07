import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuardService implements CanActivate {
  // Track navigation to prevent loops
  private lastNavigationTime = 0;
  private navigationThreshold = 1000; // minimum ms between navigations
  private redirecting = false;

  constructor(private authService: AuthService, private router: Router) {
    // Check if we need to redirect when the service is first created
    this.checkAuthAndRedirect();
  }

  // This method can be called from app component init to handle initial auth redirects
  checkAuthAndRedirect(): void {
    // If we're already on the auth page but logged in, redirect to dashboard
    if (window.location.pathname === '/auth') {
      this.authService.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
        if (isAuthenticated) {
          console.log('Already authenticated on auth page, redirecting to dashboard');
          const userData = this.authService.getUserData();
          if (userData) {
            this.navigateToDashboard(userData.userType);
          }
        }
      });
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Get the current URL from the state
    const currentUrl = state.url;
    console.log('Dashboard guard checking URL:', currentUrl);

    // Special case: when on auth page and already authenticated, immediately redirect
    if (currentUrl === '/auth') {
      return this.authService.isAuthenticated$.pipe(
        take(1),
        tap(isAuthenticated => {
          if (isAuthenticated) {
            console.log('Already authenticated on auth page, redirecting to dashboard from guard');
            const userData = this.authService.getUserData();
            if (userData) {
              this.navigateToDashboard(userData.userType);
            }
          }
        }),
        map(() => false) // Cancel current navigation regardless
      );
    }

    // Prevent redirect loops by checking if we've navigated recently
    const now = Date.now();
    if (this.redirecting || (now - this.lastNavigationTime < this.navigationThreshold)) {
      console.log('Navigation guard - preventing rapid redirects');
      this.redirecting = false;
      return of(true);
    }

    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        console.log('Dashboard guard - isAuthenticated:', isAuthenticated);

        if (!isAuthenticated) {
          console.log('Not authenticated, redirecting to auth');
          if (!currentUrl.includes('/auth')) {
            this.redirectToUrl('/auth');
          }
          return false;
        }

        const userData = this.authService.getUserData();
        if (!userData) {
          console.log('No user data, redirecting to auth');
          if (!currentUrl.includes('/auth')) {
            this.redirectToUrl('/auth');
          }
          return false;
        }

        console.log('Dashboard guard - user type:', userData.userType);

        const dashboardPath = this.getDashboardPath(userData.userType);
        if (!dashboardPath) {
          console.log('Unknown user type, redirecting to auth');
          if (!currentUrl.includes('/auth')) {
            this.redirectToUrl('/auth');
          }
          return false;
        }

        // Only redirect if we're not already at the correct dashboard
        // Note: compare paths without considering query params
        const currentPath = currentUrl.split('?')[0];
        const targetPath = dashboardPath.split('?')[0];

        if (currentPath === '/auth' && isAuthenticated) {
          console.log(`Redirecting from auth to dashboard: ${dashboardPath}`);
          this.redirectToUrl(dashboardPath);
          return false;
        }

        if (currentPath !== targetPath && !currentPath.startsWith(targetPath + '/')) {
          // Make sure we're not in an infinite loop
          if (currentPath !== '/auth' || !this.redirecting) {
            console.log(`Redirecting from ${currentPath} to correct dashboard: ${dashboardPath}`);
            this.redirectToUrl(dashboardPath);
            return false; // Return false to cancel the current navigation
          }
        }

        return true;
      })
    );
  }

  private getDashboardPath(userType: string): string | null {
    switch (userType) {
      case 'SuperAdmin':
        return '/dashboard/super-admin';
      case 'SchoolAdmin':
        return '/dashboard/school-admin';
      case 'Instructor':
        return '/dashboard/instructor';
      case 'Student':
        return '/dashboard/student';
      default:
        return null;
    }
  }

  private navigateToDashboard(userType: string): void {
    const dashboardPath = this.getDashboardPath(userType);
    if (dashboardPath) {
      this.redirectToUrl(dashboardPath);
    }
  }

  private redirectToUrl(url: string): void {
    // Set timestamp and status to prevent loops
    this.lastNavigationTime = Date.now();
    this.redirecting = true;

    // Use timeout to ensure we don't get into a synchronous loop
    setTimeout(() => {
      this.router.navigateByUrl(url, { replaceUrl: true })
        .then(() => {
          // Reset flag after successful navigation
          setTimeout(() => {
            this.redirecting = false;
          }, 100);
        })
        .catch(error => {
          console.error('Navigation error:', error);
          this.redirecting = false;
        });
    }, 50);
  }
}

export const dashboardGuard: CanActivateFn = (route, state) => {
  return inject(DashboardGuardService).canActivate(route, state);
};
