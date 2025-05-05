import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';
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
    // Check if user is already logged in, but don't redirect
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;

      // No success message when already logged in
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login successful:', response);
          // Navigation is handled in the auth service
        },
        error: (error) => {
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
