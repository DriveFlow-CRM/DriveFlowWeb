import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './services/auth-guard.service';
import { SuperAdminDashboardComponent } from './dashboards/super-admin-dashboard/super-admin-dashboard.component';
import { SchoolAdminDashboardComponent } from './dashboards/school-admin-dashboard/school-admin-dashboard.component';
import { InstructorDashboardComponent } from './dashboards/instructor-dashboard/instructor-dashboard.component';
import { StudentDashboardComponent } from './dashboards/student-dashboard/student-dashboard.component';
import { dashboardGuard } from './services/dashboard-guard.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  // Public routes
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomePageComponent }, // Homepage accessible without login

  // Root dashboard route - redirects to specific dashboard based on user role
  {
    path: 'dashboard',
    canActivate: [authGuard],
    resolve: {
      dashboard: () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const userData = authService.getUserData();
        if (!userData) {
          router.navigate(['/auth']);
          return false;
        }

        // Determine user role and redirect
        const userRole = userData.userType;
        let dashboardPath = '/auth';

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
            console.warn(`Unknown user role: ${userRole}, navigating to auth`);
        }

        router.navigate([dashboardPath]);
        return true;
      }
    },
    component: HomePageComponent // This won't be rendered, just a fallback
  },

  // Role-specific dashboard routes
  {
    path: 'dashboard/super-admin',
    component: SuperAdminDashboardComponent,
    canActivate: [authGuard, dashboardGuard]
  },
  {
    path: 'dashboard/school-admin',
    component: SchoolAdminDashboardComponent,
    canActivate: [authGuard, dashboardGuard]
  },
  {
    path: 'dashboard/instructor',
    component: InstructorDashboardComponent,
    canActivate: [authGuard, dashboardGuard]
  },
  {
    path: 'dashboard/student',
    component: StudentDashboardComponent,
    canActivate: [authGuard, dashboardGuard]
  },

  // Fallback route
  { path: '**', redirectTo: '' }
];
