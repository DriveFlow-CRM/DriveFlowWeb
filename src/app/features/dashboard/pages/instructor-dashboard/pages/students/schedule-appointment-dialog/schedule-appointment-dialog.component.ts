import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AppointmentService, CreateAppointmentDto } from '../../../../../../../core/services/appointment.service';
import { InstructorAssignedFile } from '../../../../../../../models/interfaces/instructor-availability.model';

@Component({
  selector: 'app-schedule-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './schedule-appointment-dialog.component.html',
  styleUrls: ['./schedule-appointment-dialog.component.css']
})
export class ScheduleAppointmentDialogComponent implements OnInit {
  appointmentForm!: FormGroup;
  isLoading = false;
  minDate = new Date();
  selectedDate: Date | null = null;

  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  appointmentTypes = [
    { value: 'theory', label: 'Lecție teoretică' },
    { value: 'practical', label: 'Lecție practică' },
    { value: 'exam', label: 'Examen' },
    { value: 'evaluation', label: 'Evaluare' }
  ];

  durations = [
    { value: 30, label: '30 minute' },
    { value: 60, label: '1 oră' },
    { value: 90, label: '1.5 ore' },
    { value: 120, label: '2 ore' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ScheduleAppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student: InstructorAssignedFile },
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      date: [null, Validators.required],
      startTime: ['', Validators.required],
      duration: [60, Validators.required],
      type: ['practical', Validators.required],
      notes: ['']
    });
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.appointmentForm.patchValue({ date });
  }

  calculateEndTime(startTime: string, durationMinutes: number): string {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));
    const startMinutes = hours * 60 + minutes;
    // Ensure durationMinutes is a number (form values can be strings)
    const endMinutes = startMinutes + Number(durationMinutes);

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  getEndTime(): string {
    const startTime = this.appointmentForm.get('startTime')?.value;
    const duration = this.appointmentForm.get('duration')?.value;

    if (startTime && duration) {
      return this.calculateEndTime(startTime, duration);
    }
    return '';
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isLoading = true;

      const formValue = this.appointmentForm.value;
      const appointmentData: CreateAppointmentDto = {
        date: this.formatDateForApi(formValue.date),
        startHour: formValue.startTime,
        endHour: this.getEndTime(),
        fileId: this.data.student.fileId
      };

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Programare creată cu succes!', 'Închide', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating appointment:', error);
          this.snackBar.open('Eroare la crearea programării. Încearcă din nou.', 'Închide', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  formatDateForApi(date: Date | string): string {
    if (!date) return '';
    
    // If it's already a string (from HTML date input), return it directly
    if (typeof date === 'string') {
      return date; // Already in YYYY-MM-DD format
    }
    
    // If it's a Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
