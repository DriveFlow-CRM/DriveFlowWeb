import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/pages/home/home-page.component';
import { AuthComponent } from './features/auth/pages/login/auth.component';
import { authGuard } from './core/guards/auth-guard.service';
import { SuperAdminDashboardComponent } from './features/dashboard/pages/super-admin-dashboard/super-admin-dashboard.component';
import { SchoolAdminDashboardComponent } from './features/dashboard/pages/school-admin-dashboard/school-admin-dashboard.component';
import { InstructorDashboardComponent } from './features/dashboard/pages/instructor-dashboard/instructor-dashboard.component';
import { StudentDashboardComponent } from './features/dashboard/pages/student-dashboard/student-dashboard.component';
import { dashboardGuard } from './core/guards/dashboard-guard.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

// Super Admin Dashboard Pages
import { OverviewComponent } from './features/dashboard/pages/super-admin-dashboard/pages/overview/overview.component';
import { SchoolsComponent } from './features/dashboard/pages/super-admin-dashboard/pages/schools/schools.component';
import { PaymentsComponent } from './features/dashboard/pages/super-admin-dashboard/pages/payments/payments.component';
import { StatisticsComponent } from './features/dashboard/pages/super-admin-dashboard/pages/statistics/statistics.component';
import { SchoolDetailsComponent } from './features/dashboard/pages/super-admin-dashboard/pages/school-details/school-details.component';

// School Admin Dashboard Pages
import { OverviewComponent as SchoolOverviewComponent } from './features/dashboard/pages/school-admin-dashboard/pages/overview/overview.component';
import { CarsComponent } from './features/dashboard/pages/school-admin-dashboard/pages/cars/cars.component';
import { InstructorsComponent as SchoolInstructorsComponent } from './features/dashboard/pages/school-admin-dashboard/pages/instructors/instructors.component';
import { StatisticsComponent as SchoolStatisticsComponent } from './features/dashboard/pages/school-admin-dashboard/pages/statistics/statistics.component';
import { FilesComponent } from './features/dashboard/pages/school-admin-dashboard/pages/files/files.component';
import { PaymentsComponent as SchoolPaymentsComponent } from './features/dashboard/pages/school-admin-dashboard/pages/payments/payments.component';

// School Profile Page
import { SchoolProfileComponent } from './features/school/pages/school-profile/school-profile.component';

export const routes: Routes = [
  // Public routes
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomePageComponent }, // Homepage accessible without login
  { path: 'school/:id/:name', component: SchoolProfileComponent }, // School profile page

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

  // Super Admin Dashboard routes
  {
    path: 'dashboard/super-admin',
    component: SuperAdminDashboardComponent,
    canActivate: [authGuard, dashboardGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'schools', component: SchoolsComponent },
      { path: 'schools/:id', component: SchoolDetailsComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'statistics', component: StatisticsComponent },
    ]
  },

  // Other role-specific dashboard routes
  {
    path: 'dashboard/school-admin',
    component: SchoolAdminDashboardComponent,
    canActivate: [authGuard, dashboardGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: SchoolOverviewComponent },
      { path: 'cars', component: CarsComponent },
      { path: 'instructors', component: SchoolInstructorsComponent },
      { path: 'statistics', component: SchoolStatisticsComponent },
      { path: 'files', component: FilesComponent },
      { path: 'payments', component: SchoolPaymentsComponent },
    ]
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
