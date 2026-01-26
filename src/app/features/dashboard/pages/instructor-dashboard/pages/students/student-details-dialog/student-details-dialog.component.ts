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
import { InstructorAssignedFile, FileDetails } from '../../../../../../../models/interfaces/instructor-availability.model';
import { InstructorAvailabilityService } from '../../../../../../../core/services/instructor-availability.service';

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
  student: InstructorAssignedFile;
  fileDetails: FileDetails | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<StudentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student: InstructorAssignedFile },
    private instructorService: InstructorAvailabilityService,
    private snackBar: MatSnackBar
  ) {
    this.student = data.student;
  }

  ngOnInit(): void {
    this.loadFileDetails();
  }

  loadFileDetails(): void {
    const fileId = this.student.fileId;
    
    if (!fileId) {
      // No fileId available - just show basic info from student object
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.instructorService.getFileDetails(fileId).subscribe({
      next: (details) => {
        this.fileDetails = details;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading file details:', error);
        // Don't show error, just use basic data from student object
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    if (status?.toUpperCase() === 'APPROVED') {
      return '#10B981'; // green
    }
    return '#6B7280'; // gray
  }

  getStatusIcon(status: string): string {
    if (status?.toUpperCase() === 'APPROVED') {
      return 'check_circle';
    }
    return 'help_outline';
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
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTransmissionLabel(type: string): string {
    switch (type?.toUpperCase()) {
      case 'MANUAL':
        return 'Manuală';
      case 'AUTOMATIC':
        return 'Automată';
      default:
        return type || 'N/A';
    }
  }

  getProgressPercentage(): number {
    if (!this.fileDetails) return 0;
    const lessons = this.fileDetails.lessonsMade?.length || 0;
    const required = this.fileDetails.minDrivingLessonsRequired || 1;
    return Math.min(Math.round((lessons / required) * 100), 100);
  }

  contactStudent(): void {
    const phone = this.fileDetails?.phoneNo || this.student?.phoneNumber;
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      this.snackBar.open('Număr de telefon indisponibil', 'Închide', { duration: 3000 });
    }
  }

  emailStudent(): void {
    const email = this.fileDetails?.email || this.student?.email;
    if (email) {
      window.open(`mailto:${email}`, '_self');
    } else {
      this.snackBar.open('Adresă email indisponibilă', 'Închide', { duration: 3000 });
    }
  }

  scheduleAppointment(): void {
    this.dialogRef.close('schedule');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
