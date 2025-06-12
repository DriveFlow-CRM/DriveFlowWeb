import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService, StudentFileDto } from '../../../../../../../core/services/student.service';
import { AppointmentService, AppointmentDto } from '../../../../../../../core/services/appointment.service';
import { InstructorAssignedFile } from '../../../../../../../models/interfaces/instructor-availability.model';

@Component({
  selector: 'app-student-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './student-details-dialog.component.html',
  styleUrls: ['./student-details-dialog.component.css']
})
export class StudentDetailsDialogComponent implements OnInit {
  studentDetails: StudentFileDto | null = null;
  studentAppointments: AppointmentDto[] = [];
  isLoading = false;
  isLoadingAppointments = false;

  constructor(
    public dialogRef: MatDialogRef<StudentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student: InstructorAssignedFile },
    private studentService: StudentService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudentDetails();
    this.loadStudentAppointments();
  }

  loadStudentDetails(): void {
    // Note: We need to find a way to get studentId from the student email or other identifier
    // For now, we'll use the existing data from InstructorAssignedFile
    this.studentDetails = {
      fileId: 0, // Not available in InstructorAssignedFile interface
      status: this.data.student.status,
      scholarshipStartDate: this.data.student.scholarshipStartDate,
      criminalRecordExpiryDate: '', // Not available in InstructorAssignedFile interface
      medicalRecordExpiryDate: '', // Not available in InstructorAssignedFile interface
      type: this.data.student.type,
      firstName: this.data.student.firstName,
      lastName: this.data.student.lastName,
      email: this.data.student.email,
      phoneNumber: this.data.student.phoneNumber,
      licensePlateNumber: this.data.student.licensePlateNumber,
      transmissionType: this.data.student.transmissionType
    };
  }

  loadStudentAppointments(): void {
    // Since we don't have fileId in InstructorAssignedFile, we'll show placeholder
    this.isLoadingAppointments = true;
    // We would use student ID here, but we'll show a placeholder for now
    this.isLoadingAppointments = false;
    this.studentAppointments = [];
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#6366F1';
      case 'archived':
        return '#6B7280';
      default:
        return '#64748B';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'check_circle';
      case 'pending':
        return 'schedule';
      case 'completed':
        return 'task_alt';
      case 'archived':
        return 'archive';
      default:
        return 'help';
    }
  }

  getLicenseTypeColor(type: string): string {
    switch (type) {
      case 'A':
        return '#EF4444';
      case 'B':
        return '#3B82F6';
      case 'C':
        return '#10B981';
      case 'D':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    return timeString;
  }

  contactStudent(): void {
    if (this.studentDetails?.phoneNumber) {
      window.open(`tel:${this.studentDetails.phoneNumber}`, '_self');
    } else {
      this.snackBar.open('No phone number available', 'Close', { duration: 3000 });
    }
  }

  emailStudent(): void {
    if (this.studentDetails?.email) {
      window.open(`mailto:${this.studentDetails.email}`, '_self');
    } else {
      this.snackBar.open('No email address available', 'Close', { duration: 3000 });
    }
  }

  scheduleAppointment(): void {
    this.dialogRef.close('schedule');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
