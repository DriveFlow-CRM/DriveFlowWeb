import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Instructor } from '../../../../../../../models/interfaces/instructor.model';
import { TeachingCategory } from '../../../../../../../models/interfaces/teaching-category.model';

@Component({
  selector: 'app-assign-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './assign-category-dialog.component.html',
  styleUrls: ['./assign-category-dialog.component.css']
})
export class AssignCategoryDialogComponent {
  assignForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AssignCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      instructor: Instructor;
      availableCategories: TeachingCategory[];
    }
  ) {
    // Apply dialog styling class
    this.dialogRef.addPanelClass('assign-category-dialog');

    this.assignForm = this.formBuilder.group({
      teachingCategoryId: ['', [Validators.required]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.assignForm.valid) {
      this.dialogRef.close(this.assignForm.value);
    } else {
      // Mark all fields as touched to show validation errors
      this.assignForm.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.assignForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.assignForm.get(fieldName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Acest câmp este obligatoriu';
    }

    return 'Acest câmp conține erori';
  }
}
