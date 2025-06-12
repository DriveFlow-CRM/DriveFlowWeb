import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentFileService, AvailableSlot, CreateFileAppointmentDto } from '../../../../../../core/services/student-file.service';

@Component({
  selector: 'app-create-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './create-appointment-dialog.component.html',
  styleUrls: ['./create-appointment-dialog.component.css']
})
export class CreateAppointmentDialogComponent implements OnInit {
  appointmentForm!: FormGroup;
  isLoading = false;
  loadingSlots = false;
  availableDates: string[] = [];
  availableTimesForDate: AvailableSlot[] = [];
  selectedDate: string = '';
  selectedTimeSlot: string = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateAppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      fileId: number;
      availableSlots: AvailableSlot[];
      instructor?: any;
    },
    private studentFileService: StudentFileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.generateAvailableDates();
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      date: ['', [Validators.required]],
      timeSlot: ['', [Validators.required]]
    });
  }

  generateAvailableDates(): void {
    // Generate next 30 days as available dates (excluding weekends if needed)
    const dates: string[] = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends (optional - remove if weekends are allowed)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    this.availableDates = dates;
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.appointmentForm.patchValue({ date: date, timeSlot: '' });
    this.selectedTimeSlot = '';
    this.loadAvailableTimesForDate(date);
  }

  selectTimeSlot(slot: AvailableSlot): void {
    const timeSlotValue = `${slot.startHour}-${slot.endHour}`;
    this.selectedTimeSlot = timeSlotValue;
    this.appointmentForm.patchValue({ timeSlot: timeSlotValue });
  }

  loadAvailableTimesForDate(selectedDate: string): void {
    this.loadingSlots = true;
    this.availableTimesForDate = [];

    this.studentFileService.getAvailableSlots(this.data.fileId, selectedDate)
      .subscribe({
        next: (response) => {
          this.availableTimesForDate = response.availableSlots;
          this.loadingSlots = false;
        },
        error: (error) => {
          console.error('Error loading slots for date:', error);
          this.availableTimesForDate = [];
          this.loadingSlots = false;
          this.showErrorMessage('Nu s-au putut încărca orele disponibile pentru această dată');
        }
      });
  }

  getDateButtonClass(date: string): string {
    const baseClass = 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary';
    const selectedClass = 'border-primary bg-primary text-white hover:bg-primary-dark';

    return this.selectedDate === date ? selectedClass : baseClass;
  }

  getTimeButtonClass(slot: AvailableSlot): string {
    const timeSlotValue = `${slot.startHour}-${slot.endHour}`;
    const baseClass = 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary';
    const selectedClass = 'border-primary bg-primary text-white hover:bg-primary-dark';

    return this.selectedTimeSlot === timeSlotValue ? selectedClass : baseClass;
  }

  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { weekday: 'short' });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isLoading = true;

      const formValue = this.appointmentForm.value;
      const selectedSlot = this.availableTimesForDate.find(
        slot => `${slot.startHour}-${slot.endHour}` === formValue.timeSlot
      );

      if (!selectedSlot) {
        this.showErrorMessage('Slotul selectat nu este valid');
        this.isLoading = false;
        return;
      }

      const appointmentRequest: CreateFileAppointmentDto = {
        date: formValue.date,
        startHour: selectedSlot.startHour,
        endHour: selectedSlot.endHour
      };

      this.studentFileService.createFileAppointment(this.data.fileId, appointmentRequest).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.snackBar.open('Programarea a fost creată cu succes!', 'Închide', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(response);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error creating appointment:', error);
          const errorMessage = error?.error?.message || 'Nu s-a putut crea programarea. Încercați din nou.';
          this.showErrorMessage(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short'
    });
  }

  formatTimeSlot(slot: AvailableSlot): string {
    return `${slot.startHour} - ${slot.endHour}`;
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Închide', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
