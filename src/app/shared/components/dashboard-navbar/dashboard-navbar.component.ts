import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { 
  NavItem, 
  getNavigationConfig, 
  getRoleDisplayName 
} from '../../../core/config/navigation.config';

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
  roleDisplayName = '';
  baseRoute = '';
  navItems: NavItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userRole = userData.userType;
      
      // Get navigation config for user role
      const config = getNavigationConfig(this.userRole);
      if (config) {
        this.baseRoute = config.baseRoute;
        this.navItems = config.navItems;
        this.roleDisplayName = config.roleDisplayName;
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
