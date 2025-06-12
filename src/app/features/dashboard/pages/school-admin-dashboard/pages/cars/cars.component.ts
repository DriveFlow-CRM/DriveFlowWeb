import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';

import { VehicleService } from '../../../../../../core/services/vehicle.service';
import { Vehicle, TransmissionType, FuelType, PowertrainType } from '../../../../../../models/interfaces/vehicle.model';
import { LicenseService } from '../../../../../../core/services/license.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { DeleteConfirmationDialogComponent } from '../../../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { VehicleFormDialogComponent } from './vehicle-form-dialog/vehicle-form-dialog.component';

interface VehicleWithLicense extends Vehicle {
  licenseTypeName?: string;
}

// Interface for fuel type display
interface FuelTypeOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-cars',
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
    MatIconModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    VehicleFormDialogComponent
  ],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  vehicles: VehicleWithLicense[] = [];
  licenses: Map<number, string> = new Map();
  schoolId: number = 0;
  loading: boolean = true;

  // Enums for dropdowns
  transmissionTypes = Object.values(TransmissionType);
  fuelTypeOptions: FuelTypeOption[] = [
    { value: FuelType.BENZINA, viewValue: 'BENZINA' },
    { value: FuelType.MOTORINA, viewValue: 'MOTORINA' },
    { value: FuelType.ELECTRIC, viewValue: 'ELECTRIC' },
    { value: FuelType.HIBRID, viewValue: 'HIBRID' },
    { value: FuelType.HIDROGEN, viewValue: 'HIDROGEN' },
    { value: FuelType.GNC, viewValue: 'GNC - Gaz' }
  ];
  powertrainTypes = Object.values(PowertrainType);

  constructor(
    private vehicleService: VehicleService,
    private licenseService: LicenseService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData?.schoolId) {
      this.schoolId = userData.schoolId;
      this.loadVehicles();
    }
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getVehicles(this.schoolId)
      .pipe(
        switchMap(vehicles => {
          // Convert all transmission types to uppercase
          vehicles = vehicles.map(vehicle => ({
            ...vehicle,
            transmissionType: this.normalizeTransmissionType(vehicle.transmissionType)
          }));

          // Get all licenses at once
          return this.licenseService.getLicenses().pipe(
            map(licenses => {
              // Create a map of licenseId to license type
              const licenseMap = new Map<number, string>();
              licenses.forEach(license => {
                licenseMap.set(license.licenseId, license.type);
              });

              // Add licenseTypeName to each vehicle
              return vehicles.map(vehicle => ({
                ...vehicle,
                licenseTypeName: licenseMap.get(vehicle.licenseId) || 'Unknown'
              }));
            })
          );
        })
      )
      .subscribe({
        next: (vehiclesWithLicenses) => {
          this.vehicles = vehiclesWithLicenses;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          this.loading = false;
        }
      });
  }

  openAddVehicleDialog(): void {
    const dialogRef = this.dialog.open(VehicleFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'vehicle-form-dialog',
      disableClose: false,
      autoFocus: false,
      data: {
        isEditing: false,
        transmissionTypes: this.transmissionTypes,
        fuelTypeOptions: this.fuelTypeOptions,
        powertrainTypes: this.powertrainTypes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addVehicle(result);
      }
    });
  }

  openEditVehicleDialog(vehicle: Vehicle): void {
    // Format dates for the form, handling null values
    const formattedVehicle = {
      ...vehicle,
      itpExpiryDate: vehicle.itpExpiryDate ? new Date(vehicle.itpExpiryDate) : null,
      insuranceExpiryDate: vehicle.insuranceExpiryDate ? new Date(vehicle.insuranceExpiryDate) : null,
      rcaExpiryDate: vehicle.rcaExpiryDate ? new Date(vehicle.rcaExpiryDate) : null
    };

    const dialogRef = this.dialog.open(VehicleFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'vehicle-form-dialog',
      disableClose: false,
      autoFocus: false,
      data: {
        isEditing: true,
        vehicle: formattedVehicle,
        transmissionTypes: this.transmissionTypes,
        fuelTypeOptions: this.fuelTypeOptions,
        powertrainTypes: this.powertrainTypes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateVehicle(vehicle.vehicleId, result);
      }
    });
  }

  addVehicle(vehicleData: any): void {
    // Format dates to ISO strings if they exist, otherwise null
    const formattedData = {
      ...vehicleData,
      // Convert transmission type to uppercase
      transmissionType: vehicleData.transmissionType ? vehicleData.transmissionType.toUpperCase() : '',
      itpExpiryDate: vehicleData.itpExpiryDate ? new Date(vehicleData.itpExpiryDate).toISOString() : null,
      insuranceExpiryDate: vehicleData.insuranceExpiryDate ? new Date(vehicleData.insuranceExpiryDate).toISOString() : null,
      rcaExpiryDate: vehicleData.rcaExpiryDate ? new Date(vehicleData.rcaExpiryDate).toISOString() : null
    };

    this.vehicleService.addVehicle(this.schoolId, formattedData)
      .subscribe({
        next: () => {
          this.loadVehicles();
        },
        error: (error) => console.error('Error adding vehicle:', error)
      });
  }

  updateVehicle(vehicleId: number, vehicleData: any): void {
    // Format dates to ISO strings if they exist, otherwise null
    const formattedData = {
      ...vehicleData,
      // Convert transmission type to uppercase
      transmissionType: vehicleData.transmissionType ? vehicleData.transmissionType.toUpperCase() : '',
      itpExpiryDate: vehicleData.itpExpiryDate ? new Date(vehicleData.itpExpiryDate).toISOString() : null,
      insuranceExpiryDate: vehicleData.insuranceExpiryDate ? new Date(vehicleData.insuranceExpiryDate).toISOString() : null,
      rcaExpiryDate: vehicleData.rcaExpiryDate ? new Date(vehicleData.rcaExpiryDate).toISOString() : null
    };

    this.vehicleService.updateVehicle(vehicleId, formattedData)
      .subscribe({
        next: () => {
          this.loadVehicles();
        },
        error: (error) => console.error('Error updating vehicle:', error)
      });
  }

  confirmDelete(vehicle: Vehicle): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        name: `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlateNumber})`,
        type: 'Autoturism'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteVehicle(vehicle.vehicleId);
      }
    });
  }

  deleteVehicle(vehicleId: number): void {
    this.vehicleService.deleteVehicle(vehicleId)
      .subscribe({
        next: () => this.loadVehicles(),
        error: (error) => console.error('Error deleting vehicle:', error)
      });
  }

  // Check if a date is expired
  isDateExpired(dateString: string | null): boolean {
    if (!dateString) return false;

    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  }

  // Check if a date is expiring within 30 days
  isDateExpiring(dateString: string | null): boolean {
    if (!dateString) return false;

    const expiryDate = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return !this.isDateExpired(dateString) && expiryDate <= thirtyDaysFromNow;
  }

  // Check if any vehicle has documents that will expire soon
  hasExpiringDocuments(): boolean {
    if (!this.vehicles.length) return false;

    return this.vehicles.some(vehicle =>
      this.isDateExpiring(vehicle.itpExpiryDate) ||
      this.isDateExpiring(vehicle.insuranceExpiryDate) ||
      this.isDateExpiring(vehicle.rcaExpiryDate)
    );
  }

  // Check if any vehicle has expired documents
  hasExpiredDocuments(): boolean {
    if (!this.vehicles.length) return false;

    return this.vehicles.some(vehicle =>
      this.isDateExpired(vehicle.itpExpiryDate) ||
      this.isDateExpired(vehicle.insuranceExpiryDate) ||
      this.isDateExpired(vehicle.rcaExpiryDate)
    );
  }

  // Method to get display value for fuel type
  getFuelTypeDisplay(value: string): string {
    const option = this.fuelTypeOptions.find(opt => opt.value === value);
    return option ? option.viewValue : value;
  }

  // Format license plate with visual separation for better readability
  formatLicensePlate(licensePlate: string): string {
    if (!licensePlate) return '';

    // First, extract parts using regex
    const match = licensePlate.match(/^(AB|AG|AR|B|BC|BH|BN|BR|BT|BV|BZ|CJ|CL|CS|CT|CV|DB|DJ|GJ|GL|GR|HD|HR|IF|IL|IS|MH|MM|MS|NT|OT|PH|SB|SJ|SM|SV|TL|TM|TR|VL|VN|VS)([0-9]{3})([A-Z]{3})$/);

    if (match) {
      const [_, county, numbers, letters] = match;
      return `${county} ${numbers} ${letters}`;
    }

    // If it doesn't match the pattern, return as is
    return licensePlate;
  }

  // Normalize transmission type to uppercase for display
  normalizeTransmissionType(transmissionType: string): string {
    if (!transmissionType) return '';
    return transmissionType.toUpperCase();
  }
}
