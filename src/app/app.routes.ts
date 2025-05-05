import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './services/auth-guard.service';

export const routes: Routes = [
  // Public routes
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomePageComponent }, // Homepage accessible without login

  // Protected routes
  // Add protected routes here with authGuard
  // Example: { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // Fallback route
  { path: '**', redirectTo: '' }
];
