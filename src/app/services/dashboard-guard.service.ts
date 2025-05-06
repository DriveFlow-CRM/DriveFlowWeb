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
    console.log('DashboardGuard checking access to:', state.url);

    const userData = this.authService.getUserData();

    // User should already be authenticated (authGuard should handle this)
    if (!userData) {
      console.log('No user data found, redirecting to auth');
      this.router.navigate(['/auth']);
      return false;
    }

    // Get the requested dashboard path and user's allowed path
    const requestedPath = state.url;
    const userRole = userData.userType;
    const authorizedPath = this.getRoleSpecificPath(userRole);

    console.log('User role:', userRole);
    console.log('Authorized path:', authorizedPath);
    console.log('Requested path:', requestedPath);

    // Check if the user is trying to access their authorized dashboard
    // Instead of exact match, check if the requested path starts with the authorized path
    if (!requestedPath.startsWith(authorizedPath)) {
      console.log('User not authorized for this path, redirecting to:', authorizedPath);
      this.router.navigate([authorizedPath]);
      return false;
    }

    console.log('Dashboard access granted');
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
