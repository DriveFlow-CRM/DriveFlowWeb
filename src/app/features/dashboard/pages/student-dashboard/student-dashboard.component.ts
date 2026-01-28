import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardNavbarComponent } from '../../../../shared/components/dashboard-navbar/dashboard-navbar.component';
import { DriveBotChatComponent } from '../../../../shared/components/drivebot-chat/drivebot-chat.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    DashboardNavbarComponent,
    DriveBotChatComponent
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent {
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
