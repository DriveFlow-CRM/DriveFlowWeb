import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrls: ['./dashboard-navbar.component.css']
})
export class DashboardNavbarComponent implements OnInit, OnDestroy {
  @Input() userEmail: string = '';
  isExpanded: boolean = false;
  isMobile: boolean = false;
  userName = '';
  userRole = '';
  baseRoute = '';
  navItems: NavItem[] = [];

  // Super Admin navigation items
  private superAdminNavItems: NavItem[] = [
    { path: 'overview', icon: 'dashboard', label: 'Overview' },
    { path: 'schools', icon: 'school', label: 'Schools' },
    { path: 'payments', icon: 'payments', label: 'Payments' },
    { path: 'statistics', icon: 'bar_chart', label: 'Statistics' }
  ];

  // School Admin navigation items
  private schoolAdminNavItems: NavItem[] = [
    { path: 'overview', icon: 'dashboard', label: 'Prezentare generală' },
    { path: 'cars', icon: 'directions_car', label: 'Mașini' },
    { path: 'instructors', icon: 'person', label: 'Instructori' },
    { path: 'statistics', icon: 'bar_chart', label: 'Statistică' },
    { path: 'files', icon: 'folder', label: 'Dosare' },
    { path: 'payments', icon: 'payments', label: 'Plăți' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userRole = userData.userType;

      // Set navigation items based on role
      if (this.userRole === 'SuperAdmin') {
        this.baseRoute = '/dashboard/super-admin';
        this.navItems = this.superAdminNavItems;
      } else if (this.userRole === 'SchoolAdmin') {
        this.baseRoute = '/dashboard/school-admin';
        this.navItems = this.schoolAdminNavItems;
      }
    }

    // Check if screen is mobile on init
    this.checkScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    // Clean up event listener when component is destroyed
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768; // Consider mobile if width is less than 768px

    // Close menu when switching from mobile to desktop
    if (wasMobile && !this.isMobile && this.isExpanded) {
      this.closeMenu();
    }
  }

  // Get the full route for a navigation item
  getFullRoute(path: string): string {
    return `${this.baseRoute}/${path}`;
  }

  toggleMenu(): void {
    this.isExpanded = !this.isExpanded;

    // Prevent scrolling on body when menu is open on mobile
    if (this.isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.isExpanded = false;
    document.body.style.overflow = '';
  }

  closeMenuOnMobile(): void {
    if (this.isMobile) {
      this.closeMenu();
    }
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
