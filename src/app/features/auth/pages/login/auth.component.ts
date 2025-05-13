import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../models/interfaces/auth.model';
import { PublicNavbarComponent } from '../../../../shared/components/public-navbar/public-navbar.component';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCar, faKey, faMobile, faChartBar, faClock, faPen,
  faRoad, faTrafficLight, faCalendar, faBriefcase, faChartLine,
  faFlag, faSync, faPhone, faClipboard, faCheckCircle,
  faStar, faSearch, faLaptop, faMoneyBill, faGraduationCap, faMapMarker,
  faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PublicNavbarComponent,
    FontAwesomeModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  // Font Awesome icons for animated background
  faCar = faCar;
  faKey = faKey;
  faMobile = faMobile;
  faChartBar = faChartBar;
  faClock = faClock;
  faPen = faPen;
  faRoad = faRoad;
  faTrafficLight = faTrafficLight;
  faCalendar = faCalendar;
  faBriefcase = faBriefcase;
  faChartLine = faChartLine;
  faFlag = faFlag;
  faSync = faSync;
  faPhone = faPhone;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;
  faStar = faStar;
  faSearch = faSearch;
  faLaptop = faLaptop;
  faMoneyBill = faMoneyBill;
  faGraduationCap = faGraduationCap;
  faMapMarker = faMapMarker;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  passwordVisible = false;

  authMode: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' = 'login';

  // Login form
  loginForm: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private returnUrl: string | null = null;
  isLoggedIn = false;
  private navigationAttempted = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Check for return URL in query parameters
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;

      // If already logged in and no navigation attempt was made yet,
      // let the guard handle the redirect
      if (isAuthenticated && !this.navigationAttempted) {
        console.log('User already authenticated, letting guard handle navigation');
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    // First, reset any previous error message
    this.errorMessage = '';
    // Set loading state
    this.isLoading = true;

    // Always reset loading state after 5 seconds (failsafe)
    const failsafeTimer = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Failsafe timer triggered to reset loading state');
        this.isLoading = false;
        this.errorMessage = 'Navigation to dashboard timed out. Please try again or click Dashboard link above.';
      }
    }, 5000);

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.navigationAttempted = true;
          this.successMessage = 'Login successful! Redirecting to dashboard...';

          // Reset form
          this.loginForm.reset();

          // Reset loading state
          clearTimeout(failsafeTimer);
          this.isLoading = false;

          // After successful login, the dashboard guard will handle navigation
          // Let's activate it with a small delay to ensure auth state is updated
          setTimeout(() => {
            // Use replaceUrl to avoid history accumulation
            this.router.navigateByUrl('/dashboard', { replaceUrl: true });
          }, 250);
        },
        error: (error) => {
          // Always ensure loading state is reset
          clearTimeout(failsafeTimer);
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please check your credentials.';
          console.error('Login error:', error);

          // Handle potential CORS issues by suggesting solutions
          if (error.message && error.message.includes('server')) {
            this.errorMessage += ' This could be a connection issue. Please try again later.';
          }
        }
      });
  }

  switchMode(mode: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'): void {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
