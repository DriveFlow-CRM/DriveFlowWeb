import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TeachingCategory } from '../../../../../../../models/interfaces/teaching-category.model';
import { LicenseService } from '../../../../../../../core/services/license.service';
import { Observable } from 'rxjs';

interface License {
  licenseId: number;
  type: string;
}

@Component({
  selector: 'app-teaching-category-form-dialog',
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
    MatIconModule
  ],
  templateUrl: './teaching-category-form-dialog.component.html',
  styleUrls: ['./teaching-category-form-dialog.component.css']
})
export class TeachingCategoryFormDialogComponent implements OnInit {
  categoryForm: FormGroup;
  licenses: License[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private licenseService: LicenseService,
    public dialogRef: MatDialogRef<TeachingCategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditing: boolean;
      category?: TeachingCategory;
    }
  ) {
    // Apply dialog styling class
    this.dialogRef.addPanelClass('teaching-category-dialog');

    this.categoryForm = this.formBuilder.group({
      licenseId: ['', [Validators.required]],
      sessionCost: ['', [Validators.required, Validators.min(0)]],
      sessionDuration: ['', [Validators.required, Validators.min(1)]],
      scholarshipPrice: ['', [Validators.required, Validators.min(0)]],
      minDrivingLessonsReq: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Load available license types
    this.licenseService.getLicenses().subscribe(licenses => {
      this.licenses = licenses;

      // When editing, populate the form with the category data
      if (this.data.isEditing && this.data.category) {
        this.categoryForm.patchValue({
          licenseId: this.data.category.licenseId,
          sessionCost: this.data.category.sessionCost,
          sessionDuration: this.data.category.sessionDuration,
          scholarshipPrice: this.data.category.scholarshipPrice,
          minDrivingLessonsReq: this.data.category.minDrivingLessonsReq
        });

        // If editing, disable the license selection
        this.categoryForm.get('licenseId')?.disable();
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      // If we're editing and the licenseId is disabled, we need to include it in the result
      if (this.data.isEditing && this.categoryForm.get('licenseId')?.disabled) {
        const formValue = this.categoryForm.value;
        const licenseId = this.categoryForm.get('licenseId')?.value;

        this.dialogRef.close({
          ...formValue,
          licenseId: licenseId
        });
      } else {
        this.dialogRef.close(this.categoryForm.value);
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.categoryForm.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.categoryForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Acest câmp este obligatoriu';
    }

    if (control.hasError('min')) {
      if (fieldName === 'sessionCost' || fieldName === 'scholarshipPrice') {
        return 'Valoarea trebuie să fie mai mare sau egală cu 0';
      } else {
        return 'Valoarea trebuie să fie mai mare sau egală cu 1';
      }
    }

    return 'Acest câmp conține erori';
  }
}
