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

import { SchoolDetailsComponent } from './features/dashboard/pages/super-admin-dashboard/pages/school-details/school-details.component';

// School Admin Dashboard Pages
import { OverviewComponent as SchoolOverviewComponent } from './features/dashboard/pages/school-admin-dashboard/pages/overview/overview.component';
import { CarsComponent } from './features/dashboard/pages/school-admin-dashboard/pages/cars/cars.component';
import { InstructorsComponent as SchoolInstructorsComponent } from './features/dashboard/pages/school-admin-dashboard/pages/instructors/instructors.component';
import { FilesComponent } from './features/dashboard/pages/school-admin-dashboard/pages/files/files.component';


// School Profile Page
import { SchoolProfileComponent } from './features/school/pages/school-profile/school-profile.component';

// Student Dashboard Pages
import { FileListComponent } from './features/dashboard/pages/student-dashboard/pages/file-list/file-list.component';
import { FileDetailsComponent } from './features/dashboard/pages/student-dashboard/pages/file-details/file-details.component';

// Instructor Dashboard Pages
import { AvailabilityComponent } from './features/dashboard/pages/instructor-dashboard/pages/availability/availability.component';
import { AssignedFilesComponent } from './features/dashboard/pages/instructor-dashboard/pages/assigned-files/assigned-files.component';
import { AppointmentsComponent } from './features/dashboard/pages/instructor-dashboard/pages/appointments/appointments.component';
import { InstructorOverviewComponent } from './features/dashboard/pages/instructor-dashboard/pages/overview/overview.component';
import { StudentsComponent } from './features/dashboard/pages/instructor-dashboard/pages/students/students.component';


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

      { path: 'files', component: FilesComponent },
    ]
  },
  {
    path: 'dashboard/instructor',
    component: InstructorDashboardComponent,
    canActivate: [authGuard, dashboardGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: InstructorOverviewComponent },
      { path: 'availability', component: AvailabilityComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'appointments', component: AppointmentsComponent },

      { path: 'file-details/:id', component: FileDetailsComponent }
    ]
  },
  {
    path: 'dashboard/student',
    component: StudentDashboardComponent,
    canActivate: [authGuard, dashboardGuard],
    children: [
      { path: '', component: FileListComponent },
      { path: 'file/:id', component: FileDetailsComponent }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '' }
];
