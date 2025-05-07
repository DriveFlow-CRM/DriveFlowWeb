import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardNavbarComponent } from '../../../../shared/components/dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNavbarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  userName = '';
  userRole = '';
  userEmail = '';
  schoolId = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.userRole = userData.userType;
      this.userEmail = userData.userEmail;
      // Set a default schoolId until we implement the actual logic
      this.schoolId = 1;
    }
  }
}
