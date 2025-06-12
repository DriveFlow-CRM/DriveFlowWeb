import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgClass, NgFor, NgStyle } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PublicNavbarComponent } from '../../../../shared/components/public-navbar/public-navbar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { SchoolService } from '../../../../core/services/school.service';
import { SchoolListing } from '../../../../core/models/school.model';
import { SchoolCardComponent } from '../../../../shared/components/school-card/school-card.component';
import { Subscription } from 'rxjs';
import {
  faCar, faKey, faMobile, faChartBar, faClock,
  faPen, faRoad, faTrafficLight, faCalendar,
  faBriefcase, faChartLine, faFlag, faSync,
  faPhone, faClipboard, faStar,
  faSearch, faLaptop, faMoneyBill, faCheckCircle,
  faGraduationCap, faMapMarker
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgFor,
    NgStyle,
    FontAwesomeModule,
    RouterModule,
    PublicNavbarComponent,
    SchoolCardComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  // Font Awesome icons
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
  faStar = faStar;
  faSearch = faSearch;
  faLaptop = faLaptop;
  faMoneyBill = faMoneyBill;
  faCheckCircle = faCheckCircle;
  faGraduationCap = faGraduationCap;
  faMapMarker = faMapMarker;

  isMenuOpen = false;
  currentYear = new Date().getFullYear();
  currentFeatureIndex = 0;
  totalFeatures = 4;
  touchStartX = 0;
  touchEndX = 0;

  // Authentication state
  isLoggedIn = false;
  private authSubscription?: Subscription;

  // Schools listing
  schools: SchoolListing[] = [];
  isLoadingSchools = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private schoolService: SchoolService
  ) {}

  ngOnInit(): void {
    // Check for URL fragment and scroll to that section if it exists
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Wait for the page to be fully rendered
        setTimeout(() => {
          this.scrollToElement(fragment);
        }, 100);
      }
    });

    // Subscribe to authentication state
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });

    // Load schools for the landing page
    this.loadSchools();
  }

  // Load schools from the API
  loadSchools(): void {
    this.isLoadingSchools = true;
    this.schoolService.getSchoolsListing().subscribe({
      next: (schools) => {
        this.schools = schools;
        this.isLoadingSchools = false;
      },
      error: (error) => {
        console.error('Error loading schools:', error);
        this.isLoadingSchools = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  nextFeature() {
    this.currentFeatureIndex = (this.currentFeatureIndex + 1) % this.totalFeatures;
  }

  prevFeature() {
    this.currentFeatureIndex = (this.currentFeatureIndex - 1 + this.totalFeatures) % this.totalFeatures;
  }

  setFeature(index: number) {
    this.currentFeatureIndex = index;
  }

  // Handle touch start
  handleTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  // Handle touch end
  handleTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  // Process swipe direction
  handleSwipe() {
    const swipeThreshold = 50; // Minimum distance to register a swipe
    const swipeDistance = this.touchEndX - this.touchStartX;

    if (swipeDistance > swipeThreshold) {
      // Swiped right, go to previous feature
      this.prevFeature();
    } else if (swipeDistance < -swipeThreshold) {
      // Swiped left, go to next feature
      this.nextFeature();
    }
  }

  // Smooth scroll to section
  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    this.scrollToElement(sectionId);
  }

  // Helper method to scroll to an element by ID
  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      // Close mobile menu if it's open
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
      }

      // Scroll to element with smooth behavior
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
