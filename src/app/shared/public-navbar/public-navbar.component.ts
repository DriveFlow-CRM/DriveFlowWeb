import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css'
})
export class PublicNavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isHomePage = false;
  isLoggedIn = false;
  userName: string = '';

  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initial check for homepage
    this.updateHomepageStatus();

    // Subscribe to router events
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateHomepageStatus();
    });

    // Subscribe to authentication status
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      console.log('Auth state changed:', isAuthenticated);
      this.isLoggedIn = isAuthenticated;

      // Get user's name if logged in
      if (this.isLoggedIn) {
        const userData = this.authService.getUserData();
        if (userData) {
          this.userName = `${userData.firstName} ${userData.lastName}`;
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateHomepageStatus(): void {
    // Check if we're on the homepage
    this.isHomePage = this.router.url === '/' || this.router.url === '/home';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    this.isMenuOpen = false;

    if (this.isHomePage) {
      // If we're on the homepage, scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're not on the homepage, navigate to the homepage with the section fragment
      this.router.navigate(['/'], { fragment: sectionId });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
