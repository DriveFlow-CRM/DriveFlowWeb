import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrls: ['./dashboard-navbar.component.css']
})
export class DashboardNavbarComponent implements OnInit {
  @Input() userEmail: string = '';
  isExpanded: boolean = false;
  isMobile: boolean = false;
  userName = '';
  userRole = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userRole = userData.userType;
    }

    // Check if screen is mobile on init
    this.checkScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768; // Consider mobile if width is less than 768px
    if (!this.isMobile) {
      this.isExpanded = false; // Close menu when resizing to desktop
    }
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
