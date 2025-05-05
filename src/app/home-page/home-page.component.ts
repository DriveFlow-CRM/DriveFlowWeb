import { Component } from '@angular/core';
import { NgIf, NgClass, NgFor, NgStyle } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
  imports: [NgIf, NgClass, NgFor, NgStyle, FontAwesomeModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
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
    const element = document.getElementById(sectionId);
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
