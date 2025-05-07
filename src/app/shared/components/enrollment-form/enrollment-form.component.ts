import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EnrollmentForm } from '../../models/enrollment.model';
import { SchoolService } from '../../services/school.service';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './enrollment-form.component.html',
  styleUrls: ['./enrollment-form.component.css']
})
export class EnrollmentFormComponent implements OnInit {
  @Input() schoolId!: number;

  enrollmentForm!: FormGroup;
  submitting = false;
  submissionSuccess = false;
  submissionError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private schoolService: SchoolService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.enrollmentForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      licenseNumber: [''],
      permitNumber: [''],
      preferredStartDate: [''],
      preferredTimeSlot: [''],
      message: [''],
      schoolId: [this.schoolId, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.enrollmentForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.enrollmentForm.controls).forEach(key => {
        const control = this.enrollmentForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.submissionError = null;

    const formData: EnrollmentForm = this.enrollmentForm.value;

    this.schoolService.submitEnrollment(formData).subscribe({
      next: () => {
        this.submitting = false;
        this.submissionSuccess = true;
        this.enrollmentForm.reset();
        // Set schoolId again as it's required
        this.enrollmentForm.patchValue({
          schoolId: this.schoolId
        });
      },
      error: (err) => {
        this.submitting = false;
        this.submissionError = 'An error occurred while submitting your enrollment. Please try again later.';
        console.error('Enrollment submission error:', err);
      }
    });
  }

  resetForm(): void {
    this.submissionSuccess = false;
    this.enrollmentForm.reset();
    this.enrollmentForm.patchValue({
      schoolId: this.schoolId
    });
  }
}
