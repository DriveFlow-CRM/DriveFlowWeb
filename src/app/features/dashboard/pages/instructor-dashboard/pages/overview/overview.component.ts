import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../core/services/auth.service';
import { InstructorAvailabilityService } from '../../../../../../core/services/instructor-availability.service';
import { NotificationService } from '../../../../../../core/services/notification.service';

interface DashboardStats {
  todayAppointments: number;
  upcomingLessons: number;
  totalStudents: number;
  completedLessons: number;
}

interface RecentActivity {
  type: 'appointment' | 'lesson' | 'student';
  title: string;
  description: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-instructor-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class InstructorOverviewComponent implements OnInit {
  instructorId = '';
  userName = '';
  isLoading = false;

  stats: DashboardStats = {
    todayAppointments: 0,
    upcomingLessons: 0,
    totalStudents: 0,
    completedLessons: 0
  };

  recentActivities: RecentActivity[] = [];
  todayAppointments: any[] = [];

  constructor(
    private authService: AuthService,
    private availabilityService: InstructorAvailabilityService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.instructorId = userData.userId;
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load today's appointments
    const today = new Date();
    const todayStr = this.formatDate(today);

    this.availabilityService.getInstructorAppointments(this.instructorId, todayStr, todayStr)
      .subscribe({
        next: (appointments) => {
          this.todayAppointments = appointments;
          this.stats.todayAppointments = appointments.length;
          this.updateRecentActivities();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.notificationService.showError('Nu s-au putut încărca datele. Încercați din nou.');
          this.isLoading = false;
        }
      });

    // Load assigned students
    this.availabilityService.getInstructorAssignedFiles(this.instructorId)
      .subscribe({
        next: (students) => {
          this.stats.totalStudents = students.length;
        },
        error: (error) => {
          console.error('Error loading students:', error);
        }
      });
  }

  updateRecentActivities(): void {
    this.recentActivities = [
      {
        type: 'appointment',
        title: 'Programul de astăzi',
        description: `Aveți ${this.stats.todayAppointments} programări astăzi`,
        time: 'Astăzi',
        icon: 'event'
      },
      {
        type: 'student',
        title: 'Cursanți activi',
        description: `Gestionați ${this.stats.totalStudents} cursanți`,
        time: 'Actual',
        icon: 'people'
      }
    ];
  }

  navigateToAvailability(): void {
    this.router.navigate(['/dashboard/instructor/availability']);
  }

  navigateToAppointments(): void {
    this.router.navigate(['/dashboard/instructor/appointments']);
  }

  navigateToStudents(): void {
    this.router.navigate(['/dashboard/instructor/students']);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
