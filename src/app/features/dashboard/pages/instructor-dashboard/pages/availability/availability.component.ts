import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InstructorAvailabilityService } from '../../../../../../core/services/instructor-availability.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { InstructorAvailability, CreateAvailabilityRequest } from '../../../../../../models/interfaces/instructor-availability.model';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.css']
})
export class AvailabilityComponent implements OnInit {
  availabilityForm: FormGroup;
  availabilityIntervals: InstructorAvailability[] = [];
  displayedColumns: string[] = ['date', 'startHour', 'endHour', 'actions'];
  instructorId: string = '';
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private availabilityService: InstructorAvailabilityService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
      startHour: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      endHour: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]]
    }, { validators: this.timeRangeValidator });
  }

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.instructorId = userData.userId;
      this.loadAvailability();
    }
  }

  // Custom validator to ensure end time is after start time
  timeRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startHour = group.get('startHour')?.value;
    const endHour = group.get('endHour')?.value;

    if (startHour && endHour) {
      const start = AvailabilityComponent.parseTimeToMinutes(startHour);
      const end = AvailabilityComponent.parseTimeToMinutes(endHour);

      if (end <= start) {
        return { invalidTimeRange: true };
      }
    }
    return null;
  }

  // Helper method to parse time string to minutes for comparison
  private static parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    return hours * 60 + minutes;
  }

  loadAvailability(): void {
    this.isLoading = true;
    this.availabilityService.getInstructorAvailability(this.instructorId)
      .subscribe({
        next: (data) => {
          this.availabilityIntervals = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading availability:', error);
          const errorMessage = this.extractErrorMessage(error);
          this.snackBar.open(errorMessage || 'Failed to load availability data', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.availabilityForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const dateValue = this.availabilityForm.get('date')?.value;
      let formattedDate: string;

      if (dateValue instanceof Date) {
        formattedDate = this.formatDate(dateValue);
      } else {
        formattedDate = dateValue;
      }

      const newAvailability: CreateAvailabilityRequest = {
        date: formattedDate,
        startHour: this.availabilityForm.get('startHour')?.value,
        endHour: this.availabilityForm.get('endHour')?.value
      };

      this.availabilityService.addAvailability(this.instructorId, newAvailability)
        .subscribe({
          next: () => {
            this.snackBar.open('Availability added successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadAvailability();
            this.availabilityForm.reset();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding availability:', error);
            const errorMessage = this.extractErrorMessage(error);
            this.snackBar.open(errorMessage || 'Failed to add availability', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
    }
  }

  deleteAvailability(intervalId: number): void {
    if (confirm('Are you sure you want to delete this availability interval?')) {
      this.availabilityService.deleteAvailability(this.instructorId, intervalId)
        .subscribe({
          next: () => {
            this.snackBar.open('Availability deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadAvailability();
          },
          error: (error) => {
            console.error('Error deleting availability:', error);
            const errorMessage = this.extractErrorMessage(error);
            this.snackBar.open(errorMessage || 'Failed to delete availability', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  editAvailability(interval: InstructorAvailability): void {
    // Set the form values to the selected interval
    this.availabilityForm.patchValue({
      date: interval.date,
      startHour: interval.startHour,
      endHour: interval.endHour
    });

    // You could implement an edit mode here and update the interval later
  }

  // Extract error message from API response
  private extractErrorMessage(error: any): string {
    // Check if error has the expected structure
    if (error?.error?.message) {
      return error.error.message;
    }

    // Check if error is directly the message object
    if (error?.message) {
      return error.message;
    }

    // Check for HTTP error messages
    if (error?.status) {
      switch (error.status) {
        case 400:
          return error?.error?.message || 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized to perform this action.';
        case 403:
          return 'Access denied.';
        case 404:
          return 'Resource not found.';
        case 409:
          return 'Conflict: This time interval overlaps with an existing availability.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Error ${error.status}: ${error?.error?.message || 'Unknown error occurred'}`;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  // Format date to YYYY-MM-DD for API
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for display (e.g., "June 1, 2025")
  formatDisplayDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  }
}
