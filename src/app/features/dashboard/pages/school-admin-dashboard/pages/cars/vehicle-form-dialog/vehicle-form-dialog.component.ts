import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { LicenseService, License } from '../../../../../../../core/services/license.service';

interface FuelTypeOption {
  value: string;
  viewValue: string;
}

// Custom validator for Romanian license plate format
export function romanianLicensePlateValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (!control.value) {
      return null; // Don't validate empty values to allow required validator to handle it
    }

    // Romanian license plate format regex
    const pattern = /^(AB|AG|AR|B|BC|BH|BN|BR|BT|BV|BZ|CJ|CL|CS|CT|CV|DB|DJ|GJ|GL|GR|HD|HR|IF|IL|IS|MH|MM|MS|NT|OT|PH|SB|SJ|SM|SV|TL|TM|TR|VL|VN|VS)[0-9]{3}[A-Z]{3}$/;
    const isValid = pattern.test(control.value);

    return isValid ? null : {'invalidLicensePlate': {value: control.value}};
  };
}

@Component({
  selector: 'app-vehicle-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './vehicle-form-dialog.component.html',
  styleUrls: ['./vehicle-form-dialog.component.css']
})
export class VehicleFormDialogComponent implements OnInit {
  vehicleForm: FormGroup;
  currentYear = new Date().getFullYear();
  licenses: License[] = [];
  loading = true;

  constructor(
    private fb: FormBuilder,
    private licenseService: LicenseService,
    public dialogRef: MatDialogRef<VehicleFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditing: boolean;
      vehicle?: any;
      transmissionTypes: string[];
      fuelTypeOptions: FuelTypeOption[];
      powertrainTypes: string[];
    }
  ) {
    this.vehicleForm = this.createVehicleForm();
  }

  ngOnInit(): void {
    // Fetch licenses from API
    this.loadLicenses();

    if (this.data.isEditing && this.data.vehicle) {
      this.vehicleForm.patchValue(this.data.vehicle);
    }
  }

  loadLicenses(): void {
    this.loading = true;
    this.licenseService.getLicenses().subscribe({
      next: (licenses) => {
        this.licenses = licenses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading licenses:', error);
        this.loading = false;
      }
    });
  }

  createVehicleForm(): FormGroup {
    return this.fb.group({
      licensePlateNumber: ['', [
        Validators.required,
        romanianLicensePlateValidator()
      ]],
      transmissionType: ['', [Validators.required]],
      color: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      yearOfProduction: ['', [Validators.required, Validators.min(1950), Validators.max(this.currentYear)]],
      fuelType: ['', [Validators.required]],
      engineSizeLiters: ['', [Validators.required, Validators.min(0.1), Validators.max(10)]],
      powertrainType: ['', [Validators.required]],
      itpExpiryDate: ['', [Validators.required]],
      insuranceExpiryDate: ['', [Validators.required]],
      rcaExpiryDate: ['', [Validators.required]],
      licenseId: ['', [Validators.required]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.vehicleForm.controls).forEach(key => {
        this.vehicleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.dialogRef.close(this.vehicleForm.value);
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (!field) return '';

    if (field.errors?.['required']) {
      return 'This field is required';
    }

    if (field.errors?.['min']) {
      return `Value must be at least ${field.errors['min'].min}`;
    }

    if (field.errors?.['max']) {
      return `Value must be at most ${field.errors['max'].max}`;
    }

    if (field.errors?.['invalidLicensePlate']) {
      return 'Invalid format. Use county code followed by 3 digits and 3 uppercase letters (e.g. B123ABC)';
    }

    return 'Invalid input';
  }
}
