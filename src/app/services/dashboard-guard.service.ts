import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuardService {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userData = this.authService.getUserData();

    // User should already be authenticated (authGuard should handle this)
    if (!userData) {
      this.router.navigate(['/auth']);
      return false;
    }

    // Get the requested dashboard path and user's allowed path
    const requestedPath = state.url;
    const userRole = userData.userType;
    const authorizedPath = this.getRoleSpecificPath(userRole);

    // If user tries to access dashboard they're not authorized for, redirect to their correct one
    if (requestedPath !== authorizedPath) {
      this.router.navigate([authorizedPath]);
      return false;
    }

    // User is accessing their authorized dashboard
    return true;
  }

  /**
   * Maps user roles to their specific dashboard paths
   */
  private getRoleSpecificPath(role: string): string {
    switch (role) {
      case 'SuperAdmin':
        return '/dashboard/super-admin';
      case 'SchoolAdmin':
        return '/dashboard/school-admin';
      case 'Instructor':
        return '/dashboard/instructor';
      case 'Student':
        return '/dashboard/student';
      default:
        console.warn(`Unknown user role: ${role}, redirecting to authentication`);
        return '/auth';
    }
  }
}

export const dashboardGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(DashboardGuardService).canActivate(route, state);
};
