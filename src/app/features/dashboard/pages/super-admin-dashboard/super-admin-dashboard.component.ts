import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardNavbarComponent } from '../../../../shared/components/dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNavbarComponent],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent implements OnInit {
  userName = '';
  userRole = '';
  userEmail = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userRole = userData.userType;
      this.userEmail = userData.userEmail;
    }
  }
}
