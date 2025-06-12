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

import { StudentFile, CreateFileRequest, EditFileRequest, StudentData } from '../../../../../../../models/interfaces/file.model';
import { Student } from '../../../../../../../models/interfaces/student.model';
import { Instructor } from '../../../../../../../models/interfaces/instructor.model';
import { Vehicle } from '../../../../../../../models/interfaces/vehicle.model';
import { TeachingCategory } from '../../../../../../../models/interfaces/teaching-category.model';

@Component({
  selector: 'app-file-form-dialog',
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
    MatCheckboxModule
  ],
  templateUrl: './file-form-dialog.component.html',
  styleUrls: ['./file-form-dialog.component.css']
})
export class FileFormDialogComponent implements OnInit {
  fileForm: FormGroup;
  statusOptions: string[] = ['APPROVED', 'ARCHIVED', 'EXPIRED', 'FINALISED'];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<FileFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditing: boolean;
      student?: Student | StudentData;
      file?: StudentFile;
      teachingCategories: TeachingCategory[];
      vehicles: Vehicle[];
      instructors: Instructor[];
    }
  ) {
    // Initialize the form with default values
    this.fileForm = this.formBuilder.group({
      scholarshipStartDate: [new Date(), Validators.required],
      criminalRecordExpiryDate: [new Date(new Date().setFullYear(new Date().getFullYear() + 1)), Validators.required],
      medicalRecordExpiryDate: [new Date(new Date().setMonth(new Date().getMonth() + 6)), Validators.required],
      status: ['APPROVED', Validators.required],
      teachingCategoryId: [null, Validators.required],
      vehicleId: [null],
      instructorId: [null],
      payment: this.formBuilder.group({
        sessionsPayed: [0, [Validators.required, Validators.min(0)]],
        scholarshipBasePayment: [true]
      })
    });

    // Apply dialog styling class
    this.dialogRef.addPanelClass('file-form-dialog');
  }

  ngOnInit(): void {
    // If editing, populate the form with the file data
    if (this.data.isEditing && this.data.file) {
      const file = this.data.file;

      // Format date strings to Date objects
      const scholarshipStartDate = file.scholarshipStartDate ? new Date(file.scholarshipStartDate) : null;
      const criminalRecordExpiryDate = file.criminalRecordExpiryDate ? new Date(file.criminalRecordExpiryDate) : null;
      const medicalRecordExpiryDate = file.medicalRecordExpiryDate ? new Date(file.medicalRecordExpiryDate) : null;

      // For editing, we don't include the payment fields directly
      this.fileForm = this.formBuilder.group({
        scholarshipStartDate: [scholarshipStartDate, Validators.required],
        criminalRecordExpiryDate: [criminalRecordExpiryDate, Validators.required],
        medicalRecordExpiryDate: [medicalRecordExpiryDate, Validators.required],
        status: [file.status, Validators.required],
        teachingCategoryId: [file.teachingCategory.teachingCategoryId, Validators.required],
        vehicleId: [file.vehicle?.vehicleId || null],
        instructorId: [file.instructor?.instructorId || null]
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.fileForm.valid) {
      const formValue = this.fileForm.value;

      // Format dates to strings
      const formattedData = {
        ...formValue,
        scholarshipStartDate: this.formatDate(formValue.scholarshipStartDate),
        criminalRecordExpiryDate: this.formatDate(formValue.criminalRecordExpiryDate),
        medicalRecordExpiryDate: this.formatDate(formValue.medicalRecordExpiryDate)
      };

      this.dialogRef.close(formattedData);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.fileForm);
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

  // Getters for form validation
  get scholarshipStartDateControl() { return this.fileForm.get('scholarshipStartDate'); }
  get criminalRecordExpiryDateControl() { return this.fileForm.get('criminalRecordExpiryDate'); }
  get medicalRecordExpiryDateControl() { return this.fileForm.get('medicalRecordExpiryDate'); }
  get statusControl() { return this.fileForm.get('status'); }
  get teachingCategoryIdControl() { return this.fileForm.get('teachingCategoryId'); }
}
