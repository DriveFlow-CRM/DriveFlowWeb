import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { InstructorAvailabilityService } from '../../../../../../core/services/instructor-availability.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { StudentService } from '../../../../../../core/services/student.service';
import { AppointmentService } from '../../../../../../core/services/appointment.service';
import { InstructorAssignedFile } from '../../../../../../models/interfaces/instructor-availability.model';
import { Router } from '@angular/router';
import { StudentDetailsDialogComponent } from './student-details-dialog/student-details-dialog.component';
import { ScheduleAppointmentDialogComponent } from './schedule-appointment-dialog/schedule-appointment-dialog.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatSelectModule,
    MatTabsModule
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  assignedStudents: InstructorAssignedFile[] = [];
  filteredStudents: InstructorAssignedFile[] = [];
  isLoading = false;
  instructorId = '';
  searchTerm = '';
  selectedStatus = 'all';
  selectedLicenseType = 'all';
  viewMode: 'cards' | 'table' = 'cards';

  // Pagination properties
  pageSize = 12;
  pageSizeOptions: number[] = [6, 12, 24, 48];
  pageIndex = 0;
  totalItems = 0;

  // Filter options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'archived', label: 'Archived' }
  ];

  licenseTypeOptions = [
    { value: 'all', label: 'All License Types' },
    { value: 'B', label: 'Category B' },
    { value: 'A', label: 'Category A' },
    { value: 'C', label: 'Category C' },
    { value: 'D', label: 'Category D' }
  ];

  constructor(
    private availabilityService: InstructorAvailabilityService,
    private authService: AuthService,
    private studentService: StudentService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.instructorId = userData.userId;
      this.loadAssignedStudents();
    }
  }

  loadAssignedStudents(): void {
    this.isLoading = true;
    this.availabilityService.getInstructorAssignedFiles(this.instructorId)
      .subscribe({
        next: (data) => {
          this.assignedStudents = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading assigned students:', error);
          this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.assignedStudents];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTermLower) ||
        student.lastName.toLowerCase().includes(searchTermLower) ||
        student.email.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(student =>
        student.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    // Apply license type filter
    if (this.selectedLicenseType !== 'all') {
      filtered = filtered.filter(student =>
        student.type === this.selectedLicenseType
      );
    }

    this.filteredStudents = filtered;
    this.totalItems = this.filteredStudents.length;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  viewStudentDetails(student: InstructorAssignedFile): void {
    const dialogRef = this.dialog.open(StudentDetailsDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: { student },
      disableClose: false,
      panelClass: 'student-details-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'schedule') {
        this.scheduleLesson(student);
      }
    });
  }

  scheduleLesson(student: InstructorAssignedFile): void {
    const dialogRef = this.dialog.open(ScheduleAppointmentDialogComponent, {
      width: '550px',
      maxHeight: '85vh',
      data: { student },
      disableClose: false,
      panelClass: 'schedule-appointment-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the student list or show success message
        this.snackBar.open('Appointment scheduled successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Optionally reload the student data to show updated information
        this.loadAssignedStudents();
      }
    });
  }

  contactStudent(student: InstructorAssignedFile): void {
    if (student.phoneNumber) {
      window.open(`tel:${student.phoneNumber}`, '_self');
    } else {
      this.snackBar.open('No phone number available', 'Close', { duration: 3000 });
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10b981'; // green
      case 'archived':
        return '#6b7280'; // gray
      case 'pending':
        return '#f59e0b'; // orange
      default:
        return '#6b7280';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'check_circle';
      case 'archived':
        return 'archive';
      case 'pending':
        return 'schedule';
      default:
        return 'help';
    }
  }

  getLicenseTypeColor(type: string): string {
    switch (type) {
      case 'A':
        return '#ef4444'; // red
      case 'B':
        return '#3b82f6'; // blue
      case 'C':
        return '#10b981'; // green
      case 'D':
        return '#f59e0b'; // orange
      default:
        return '#6b7280'; // gray
    }
  }

  getCurrentPageStudents(): InstructorAssignedFile[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredStudents.slice(startIndex, startIndex + this.pageSize);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedLicenseType = 'all';
    this.applyFilters();
  }

  exportStudentList(): void {
    try {
      const dataToExport = this.filteredStudents.map(student => ({
        'Full Name': `${student.firstName} ${student.lastName}`,
        'Email': student.email,
        'Phone': student.phoneNumber || 'N/A',
        'License Type': student.type,
        'Status': student.status,
        'Vehicle': student.licensePlateNumber || 'Not assigned',
        'Transmission': student.transmissionType || 'N/A',
        'Start Date': new Date(student.scholarshipStartDate).toLocaleDateString()
      }));

      const headers = Object.keys(dataToExport[0]);
      let csvContent = headers.join(',') + '\n';

      dataToExport.forEach(row => {
        const values = headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in values
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.snackBar.open('Student list exported successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error exporting student list:', error);
      this.snackBar.open('Failed to export student list', 'Close', { duration: 3000 });
    }
  }
}
