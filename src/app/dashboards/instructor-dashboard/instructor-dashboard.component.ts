import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.css'
})
export class InstructorDashboardComponent implements OnInit {
  userEmail: string = '';
  userName: string = '';
  schoolId: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userEmail = userData.userEmail;
      this.schoolId = userData.schoolId;

      // Build full name if available
      if (userData.firstName || userData.lastName) {
        this.userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      }
    }
  }
}
