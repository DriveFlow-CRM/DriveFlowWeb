import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService, CreateAppointmentDto } from '../../../../../../../core/services/appointment.service';
import { InstructorAssignedFile } from '../../../../../../../models/interfaces/instructor-availability.model';

@Component({
  selector: 'app-schedule-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './schedule-appointment-dialog.component.html',
  styleUrls: ['./schedule-appointment-dialog.component.css']
})
export class ScheduleAppointmentDialogComponent implements OnInit {
  appointmentForm!: FormGroup;
  isLoading = false;
  minDate = new Date();

  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  appointmentTypes = [
    { value: 'theory', label: 'Theory Lesson' },
    { value: 'practical', label: 'Practical Lesson' },
    { value: 'exam', label: 'Exam' },
    { value: 'evaluation', label: 'Evaluation' }
  ];

  durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
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
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: [60, Validators.required],
      type: ['practical', Validators.required],
      notes: ['']
    });

    // Auto-calculate end time when start time or duration changes
    this.appointmentForm.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTime();
    });

    this.appointmentForm.get('duration')?.valueChanges.subscribe(() => {
      this.updateEndTime();
    });
  }

  updateEndTime(): void {
    const startTime = this.appointmentForm.get('startTime')?.value;
    const duration = this.appointmentForm.get('duration')?.value;

    if (startTime && duration) {
      const endTime = this.calculateEndTime(startTime, duration);
      this.appointmentForm.patchValue({ endTime }, { emitEvent: false });
    }
  }

  calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(num => parseInt(num));
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;

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
        fileId: 0 // Note: We need the actual fileId from the student data
      };

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Appointment scheduled successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating appointment:', error);
          this.snackBar.open('Failed to schedule appointment. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  formatDateForApi(date: Date): string {
    return date.toISOString();
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

  getFormFieldError(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    return '';
  }
}
