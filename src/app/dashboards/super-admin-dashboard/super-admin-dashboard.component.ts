import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardNavbarComponent } from '../../components/dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNavbarComponent],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent implements OnInit, AfterViewInit {
  userEmail: string = '';

  constructor(private authService: AuthService) {
    console.log('SuperAdminDashboardComponent constructor');
  }

  ngOnInit(): void {
    console.log('SuperAdminDashboardComponent initialized');
    const userData = this.authService.getUserData();
    if (userData) {
      this.userEmail = userData.userEmail;
      console.log('User email loaded:', this.userEmail);
    } else {
      console.error('No user data found in SuperAdminDashboardComponent');
    }
  }

  ngAfterViewInit(): void {
    console.log('SuperAdminDashboardComponent view initialized');
    // Check if router-outlet is rendered
    setTimeout(() => {
      const routerOutlet = document.querySelector('router-outlet');
      console.log('Router outlet found:', !!routerOutlet);

      const contentArea = document.querySelector('.dashboard-content');
      console.log('Dashboard content area found:', !!contentArea);

      if (contentArea) {
        console.log('Dashboard content area HTML:', contentArea.innerHTML.substring(0, 100) + '...');
      }
    }, 100);
  }
}
