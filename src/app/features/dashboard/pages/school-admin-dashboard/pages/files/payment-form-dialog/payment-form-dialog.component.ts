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

import { Payment, EditPaymentRequest } from '../../../../../../../models/interfaces/file.model';

@Component({
  selector: 'app-payment-form-dialog',
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
  templateUrl: './payment-form-dialog.component.html',
  styleUrls: ['./payment-form-dialog.component.css']
})
export class PaymentFormDialogComponent implements OnInit {
  paymentForm: FormGroup;
  totalCost: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<PaymentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      payment: Payment;
      sessionCost: number;
      scholarshipPrice: number;
      minDrivingLessons: number;
    }
  ) {
    // Initialize the form with values from the payment
    this.paymentForm = this.formBuilder.group({
      scholarshipBasePayment: [this.data.payment.scholarshipBasePayment, Validators.required],
      sessionsPayed: [this.data.payment.sessionsPayed, [Validators.required, Validators.min(0), Validators.max(this.data.minDrivingLessons)]]
    });

    // Apply dialog styling class
    this.dialogRef.addPanelClass('payment-form-dialog');
  }

  ngOnInit(): void {
    // Calculate initial cost
    this.updateTotalCost();

    // Listen for changes to recalculate cost
    this.paymentForm.valueChanges.subscribe(() => {
      this.updateTotalCost();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.dialogRef.close(this.paymentForm.value);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.paymentForm);
    }
  }

  // Update the total cost calculation based on form values
  private updateTotalCost(): void {
    let total = 0;
    const formValues = this.paymentForm.value;

    // Add scholarship base price if checked
    if (formValues.scholarshipBasePayment) {
      total += this.data.scholarshipPrice;
    }

    // Add cost for paid sessions
    total += (formValues.sessionsPayed * this.data.sessionCost);

    this.totalCost = total;
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

  // Format currency
  formatCurrency(value: number): string {
    return `${value} RON`;
  }
}
