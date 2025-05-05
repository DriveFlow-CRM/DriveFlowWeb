import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-school-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './school-admin-dashboard.component.html',
  styleUrl: './school-admin-dashboard.component.css'
})
export class SchoolAdminDashboardComponent implements OnInit {
  userEmail: string = '';
  schoolId: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userEmail = userData.userEmail;
      this.schoolId = userData.schoolId;
    }
  }
}
