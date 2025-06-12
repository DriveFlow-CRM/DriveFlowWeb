import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { StudentFileService, AvailableSlot, AvailableSlotsResponse, CreateFileAppointmentDto } from '../../../../../../core/services/student-file.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { StudentFileDetails, Appointment } from '../../../../../../models/interfaces/student-file.model';
import { CreateAppointmentDialogComponent } from '../create-appointment-dialog/create-appointment-dialog.component';

@Component({
  selector: 'app-file-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.css']
})
export class FileDetailsComponent implements OnInit {
  fileId: number = 0;
  fileDetails: StudentFileDetails | null = null;
  availableSlots: AvailableSlot[] = [];
  loading: boolean = true;
  loadingSlots: boolean = false;
  downloadingInvoice: boolean = false;
  currentStudentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentFileService: StudentFileService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCurrentStudent();
    this.route.paramMap.subscribe(params => {
      const fileIdParam = params.get('id');
      if (fileIdParam) {
        this.fileId = +fileIdParam;
        this.loadFileDetails();
        this.loadAvailableSlots();
      } else {
        this.router.navigate(['/dashboard/student']);
      }
    });
  }

  loadCurrentStudent(): void {
    const userData = this.authService.getUserData();
    if (userData?.userId) {
      this.currentStudentId = userData.userId;
    }
  }

  loadFileDetails(): void {
    this.loading = true;
    this.studentFileService.getFileDetails(this.fileId)
      .subscribe({
        next: (data) => {
          this.fileDetails = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading file details:', error);
          this.loading = false;
          this.showErrorMessage('Nu s-au putut încărca detaliile dosarului');
          this.router.navigate(['/dashboard/student']);
        }
      });
  }

  loadAvailableSlots(): void {
    this.loadingSlots = true;
    this.studentFileService.getAvailableSlots(this.fileId)
      .subscribe({
        next: (response: AvailableSlotsResponse) => {
          this.availableSlots = response.availableSlots;
          this.loadingSlots = false;
        },
        error: (error: any) => {
          console.error('Error loading available slots:', error);
          this.loadingSlots = false;
          // Don't show error for slots as it's secondary data
        }
      });
  }

  downloadInvoice(): void {
    this.downloadingInvoice = true;
    this.studentFileService.getFileInvoice(this.fileId)
      .subscribe({
        next: (data) => {
          this.downloadFile(data, `factura_dosar_${this.fileId}.pdf`);
          this.downloadingInvoice = false;
          this.showSuccessMessage('Factura a fost descărcată cu succes!');
        },
        error: (error) => {
          console.error('Error downloading invoice:', error);
          this.downloadingInvoice = false;
          this.showErrorMessage('Nu s-a putut genera factura pentru acest dosar');
        }
      });
  }

  createAppointment(): void {
    const dialogRef = this.dialog.open(CreateAppointmentDialogComponent, {
      maxWidth: '100vw',
      width: '100%',
      height: 'auto',
      panelClass: 'create-appointment-dialog-container',
      data: {
        fileId: this.fileId,
        availableSlots: this.availableSlots,
        instructor: this.fileDetails?.instructor
      },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccessMessage('Programarea a fost creată cu succes!');
        this.loadFileDetails();
        this.loadAvailableSlots();
      }
    });
  }

  contactInstructor(): void {
    if (this.fileDetails?.instructor) {
      const instructor = this.fileDetails.instructor;

      if (instructor.phone) {
        window.open(`tel:${instructor.phone}`, '_self');
      } else if (instructor.email) {
        window.open(`mailto:${instructor.email}`, '_self');
      } else {
        this.showErrorMessage('Nu sunt disponibile informații de contact pentru instructor');
      }
    }
  }

  emailInstructor(): void {
    if (this.fileDetails?.instructor?.email) {
      window.open(`mailto:${this.fileDetails.instructor.email}`, '_self');
    } else {
      this.showErrorMessage('Nu este disponibilă adresa de email a instructorului');
    }
  }

  getUpcomingAppointments(): Appointment[] {
    if (!this.fileDetails) return [];
    const today = new Date();
    return this.fileDetails.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && apt.status.toLowerCase() !== 'completed';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getPastAppointments(): Appointment[] {
    if (!this.fileDetails) return [];
    const today = new Date();
    return this.fileDetails.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate < today || apt.status.toLowerCase() === 'completed';
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private downloadFile(data: Blob, filename: string): void {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Închide', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Închide', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  // Format date strings to local format
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    return timeString;
  }

  // Get status color for badges
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'active':
        return 'bg-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-200 text-red-800';
      case 'approved':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'schedule';
      case 'active':
        return 'play_circle';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
      case 'rejected':
        return 'cancel';
      case 'approved':
        return 'verified';
      default:
        return 'help';
    }
  }

  // Get transmission type text
  getTransmissionType(type: string): string {
    if (!type) return 'Nu este specificat';
    return type.toLowerCase() === 'manual' ? 'Manuală' : 'Automată';
  }

  // Get status text in Romanian
  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'În așteptare';
      case 'active':
        return 'Activ';
      case 'completed':
        return 'Finalizat';
      case 'cancelled':
        return 'Anulat';
      case 'rejected':
        return 'Respins';
      case 'approved':
        return 'Aprobat';
      default:
        return status;
    }
  }
}
