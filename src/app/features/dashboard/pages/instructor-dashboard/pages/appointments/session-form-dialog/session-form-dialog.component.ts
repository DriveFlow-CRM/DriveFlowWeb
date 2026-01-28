import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SessionFormService } from '../../../../../../../core/services/session-form.service';
import {
  SessionFormTemplate,
  SessionFormItemWithMistakes,
  SubmitSessionFormRequest,
  SessionFormResult,
  MistakeEntry
} from '../../../../../../../models/interfaces/session-form.model';
import { InstructorAppointment } from '../../../../../../../models/interfaces/instructor-availability.model';

export interface SessionFormDialogData {
  appointment: InstructorAppointment;
}

@Component({
  selector: 'app-session-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './session-form-dialog.component.html',
  styleUrls: ['./session-form-dialog.component.css']
})
export class SessionFormDialogComponent implements OnInit {
  isLoading = true;
  isSubmitting = false;
  hasError = false;
  errorMessage = '';

  formTemplate: SessionFormTemplate | null = null;
  formItems: SessionFormItemWithMistakes[] = [];
  
  totalPoints = 0;
  maxPoints = 0;

  constructor(
    private dialogRef: MatDialogRef<SessionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SessionFormDialogData,
    private sessionFormService: SessionFormService,
    private snackBar: MatSnackBar
  ) {
    // Prevent closing by clicking outside or pressing escape
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  loadFormData(): void {
    this.isLoading = true;
    this.hasError = false;

    // Get form template using the license ID from the appointment
    const licenseId = this.data.appointment.licenseId;

    if (!licenseId) {
      this.hasError = true;
      this.errorMessage = 'Nu s-a putut determina categoria de licență.';
      this.isLoading = false;
      return;
    }

    this.sessionFormService.getFormByLicense(licenseId).subscribe({
      next: (template) => {
        this.formTemplate = template;
        this.maxPoints = template.maxPoints;
        this.formItems = template.items
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(item => ({
            ...item,
            mistakeCount: 0,
            totalPenalty: 0
          }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading form template:', error);
        this.hasError = true;
        this.errorMessage = 'Nu s-a putut încărca formularul. Vă rugăm încercați din nou.';
        this.isLoading = false;
      }
    });
  }

  incrementMistake(item: SessionFormItemWithMistakes): void {
    item.mistakeCount++;
    item.totalPenalty = item.mistakeCount * item.penaltyPoints;
    this.calculateTotalPoints();
  }

  decrementMistake(item: SessionFormItemWithMistakes): void {
    if (item.mistakeCount > 0) {
      item.mistakeCount--;
      item.totalPenalty = item.mistakeCount * item.penaltyPoints;
      this.calculateTotalPoints();
    }
  }

  calculateTotalPoints(): void {
    this.totalPoints = this.formItems.reduce((sum, item) => sum + item.totalPenalty, 0);
  }

  getResultStatus(): 'OK' | 'FAILED' | 'PENDING' {
    if (this.totalPoints === 0 && this.formItems.every(item => item.mistakeCount === 0)) {
      return 'PENDING';
    }
    return this.totalPoints <= this.maxPoints ? 'OK' : 'FAILED';
  }

  getResultClass(): string {
    const status = this.getResultStatus();
    switch (status) {
      case 'OK': return 'result-pass';
      case 'FAILED': return 'result-fail';
      default: return 'result-pending';
    }
  }

  hasMistakes(): boolean {
    return this.formItems.some(item => item.mistakeCount > 0);
  }

  onCancel(): void {
    if (this.hasMistakes()) {
      // Show confirmation dialog
      if (confirm('Aveți modificări nesalvate. Sigur doriți să închideți?')) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Build the mistakes array (only items with mistakes)
    const mistakes: MistakeEntry[] = this.formItems
      .filter(item => item.mistakeCount > 0)
      .map(item => ({
        id_item: item.id_item,
        count: item.mistakeCount
      }));

    const request: SubmitSessionFormRequest = {
      mistakes,
      maxPoints: this.maxPoints
    };

    this.sessionFormService.submitSessionForm(this.data.appointment.appointmentId, request).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting form:', error);
        
        if (error.status === 409) {
          this.snackBar.open('Un formular a fost deja completat pentru această programare.', 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open('Eroare la trimiterea formularului. Încercați din nou.', 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  resetForm(): void {
    this.formItems.forEach(item => {
      item.mistakeCount = 0;
      item.totalPenalty = 0;
    });
    this.totalPoints = 0;
  }
}
