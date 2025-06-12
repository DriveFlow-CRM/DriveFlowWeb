import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { Student, CreateStudentRequest } from '../../../../../../../models/interfaces/student.model';
import { StudentData } from '../../../../../../../models/interfaces/file.model';
import { TeachingCategory } from '../../../../../../../models/interfaces/teaching-category.model';
import { Vehicle } from '../../../../../../../models/interfaces/vehicle.model';
import { Instructor } from '../../../../../../../models/interfaces/instructor.model';

@Component({
  selector: 'app-student-form-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  templateUrl: './student-form-dialog.component.html',
  styleUrls: ['./student-form-dialog.component.css']
})
export class StudentFormDialogComponent implements OnInit {
  studentForm: FormGroup;
  statusOptions: string[] = ['APPROVED', 'ARCHIVED', 'EXPIRED', 'FINALISED'];
  hidePassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<StudentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditing: boolean;
      student?: Student | StudentData;
      teachingCategories?: TeachingCategory[];
      vehicles?: Vehicle[];
      instructors?: Instructor[];
    }
  ) {
    // Apply dialog styling class
    this.dialogRef.addPanelClass('student-form-dialog');

    if (this.data.isEditing && this.data.student) {
      // Edit form
      this.studentForm = this.formBuilder.group({
        firstName: [this.data.student.firstName, [Validators.required]],
        lastName: [this.data.student.lastName, [Validators.required]],
        email: [this.data.student.email, [Validators.required, Validators.email]],
        phone: [this.data.student.phoneNumber, [Validators.required, Validators.pattern(/^\d{10}$/)]],
        cnp: [this.data.student.cnp, [Validators.required, Validators.pattern(/^\d{13}$/)]],
        password: ['', [Validators.minLength(8)]]
      });
    } else {
      // Add form with full student/file/payment structure
      this.studentForm = this.formBuilder.group({
        student: this.formBuilder.group({
          firstName: ['', [Validators.required]],
          lastName: ['', [Validators.required]],
          email: ['', [Validators.required, Validators.email]],
          phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
          cnp: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
          password: ['', [Validators.required, Validators.minLength(8)]]
        }),
        payment: this.formBuilder.group({
          scholarshipBasePayment: [true],
          sessionsPayed: [0, [Validators.required, Validators.min(0)]]
        }),
        file: this.formBuilder.group({
          scholarshipStartDate: [new Date(), Validators.required],
          criminalRecordExpiryDate: [new Date(new Date().setFullYear(new Date().getFullYear() + 1)), Validators.required],
          medicalRecordExpiryDate: [new Date(new Date().setMonth(new Date().getMonth() + 6)), Validators.required],
          status: ['APPROVED', Validators.required],
          instructorId: [null],
          vehicleId: [null],
          teachingCategoryId: [null]
        })
      });
    }
  }

  ngOnInit(): void {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formValue = this.studentForm.value;

      // If it's a new student, format the dates
      if (!this.data.isEditing) {
        const fileData = formValue.file;
        formValue.file = {
          ...fileData,
          scholarshipStartDate: this.formatDate(fileData.scholarshipStartDate),
          criminalRecordExpiryDate: this.formatDate(fileData.criminalRecordExpiryDate),
          medicalRecordExpiryDate: this.formatDate(fileData.medicalRecordExpiryDate)
        };
      } else {
        // For editing, remove empty password field
        if (formValue.password === '') {
          delete formValue.password;
        }
      }

      this.dialogRef.close(formValue);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.studentForm);
    }
  }

  // Helper to format Date objects to YYYY-MM-DD strings
  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Helper to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Form field getters
  get firstNameControl() {
    return this.data.isEditing ?
      this.studentForm.get('firstName') :
      this.studentForm.get('student.firstName');
  }

  get lastNameControl() {
    return this.data.isEditing ?
      this.studentForm.get('lastName') :
      this.studentForm.get('student.lastName');
  }

  get emailControl() {
    return this.data.isEditing ?
      this.studentForm.get('email') :
      this.studentForm.get('student.email');
  }

  get phoneControl() {
    return this.data.isEditing ?
      this.studentForm.get('phone') :
      this.studentForm.get('student.phone');
  }

  get cnpControl() {
    return this.data.isEditing ?
      this.studentForm.get('cnp') :
      this.studentForm.get('student.cnp');
  }

  get passwordControl() {
    return this.data.isEditing ?
      this.studentForm.get('password') :
      this.studentForm.get('student.password');
  }
}
