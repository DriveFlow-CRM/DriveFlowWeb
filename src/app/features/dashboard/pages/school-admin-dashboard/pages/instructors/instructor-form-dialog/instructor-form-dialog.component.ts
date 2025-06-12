import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TeachingCategory } from '../../../../../../../models/interfaces/teaching-category.model';
import { LicenseService } from '../../../../../../../core/services/license.service';

@Component({
  selector: 'app-instructor-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './instructor-form-dialog.component.html',
  styleUrls: ['./instructor-form-dialog.component.css']
})
export class InstructorFormDialogComponent implements OnInit {
  instructorForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<InstructorFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditing: boolean;
      instructor?: any;
      teachingCategories: TeachingCategory[];
    }
  ) {
    // Apply dialog styling class
    this.dialogRef.addPanelClass('instructor-form-dialog');

    this.instructorForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', data.isEditing ? [] : [Validators.required, Validators.minLength(8)]],
      teachingCategoryIds: [[], [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.data.isEditing && this.data.instructor) {
      // When editing, populate the form with the instructor data
      this.instructorForm.patchValue({
        firstName: this.data.instructor.firstName,
        lastName: this.data.instructor.lastName,
        email: this.data.instructor.email,
        phone: this.data.instructor.phone,
        teachingCategoryIds: this.data.instructor.teachingCategoryIds || []
      });

      // Remove the password validator when editing
      this.instructorForm.get('password')?.clearValidators();
      this.instructorForm.get('password')?.updateValueAndValidity();
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.instructorForm.valid) {
      const formData = this.instructorForm.value;

      // If editing and password is empty, remove it from the submission
      if (this.data.isEditing && !formData.password) {
        const { password, ...dataWithoutPassword } = formData;
        this.dialogRef.close(dataWithoutPassword);
      } else {
        this.dialogRef.close(formData);
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.instructorForm.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.instructorForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.instructorForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Acest câmp este obligatoriu';
    }

    if (fieldName === 'email' && control.hasError('email')) {
      return 'Adresa de email nu este validă';
    }

    if (fieldName === 'phone' && control.hasError('pattern')) {
      return 'Numărul de telefon trebuie să conțină 10 cifre';
    }

    if (fieldName === 'password') {
      if (control.hasError('minlength')) {
        return 'Parola trebuie să conțină minim 8 caractere';
      }
    }

    return 'Acest câmp conține erori';
  }
}
