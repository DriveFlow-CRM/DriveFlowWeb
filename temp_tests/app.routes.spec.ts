import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { HomePageComponent } from './features/home/pages/home/home-page.component';
import { AuthComponent } from './features/auth/pages/login/auth.component';
import { SchoolProfileComponent } from './features/school/pages/school-profile/school-profile.component';

describe('App Routes', () => {
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getUserData', 'isAuthenticated$']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should navigate to home page for empty path', async () => {
    await router.navigate(['']);
    expect(router.url).toBe('/');
  });

  it('should navigate to auth page', async () => {
    await router.navigate(['/auth']);
    expect(router.url).toBe('/auth');
  });

  it('should navigate to school profile page', async () => {
    await router.navigate(['/school/1/test-school']);
    expect(router.url).toBe('/school/1/test-school');
  });

  it('should redirect to auth when accessing dashboard without authentication', async () => {
    authService.getUserData.and.returnValue(null);
    await router.navigate(['/dashboard']);
    expect(router.url).toBe('/auth');
  });

  it('should redirect to specific dashboard based on user role', async () => {
    authService.getUserData.and.returnValue({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
      userId: '1',
      userType: 'SuperAdmin',
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      userPhone: '1234567890',
      schoolId: 1
    });
    await router.navigate(['/dashboard']);
    expect(router.url).toBe('/dashboard/super-admin');
  });
});
