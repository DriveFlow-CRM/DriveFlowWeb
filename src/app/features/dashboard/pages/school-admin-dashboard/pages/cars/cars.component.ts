import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { VehicleService } from '../../../../../../core/services/vehicle.service';
import { Vehicle, TransmissionType, FuelType, PowertrainType } from '../../../../../../models/interfaces/vehicle.model';
import { LicenseService } from '../../../../../../core/services/license.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { DeleteConfirmationDialogComponent } from '../../../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { VehicleFormDialogComponent } from './vehicle-form-dialog/vehicle-form-dialog.component';

interface VehicleWithLicense extends Vehicle {
  licenseTypeName?: string;
}

interface FuelTypeOption {
  value: string;
  viewValue: string;
}

interface SummaryStats {
  totalVehicles: number;
  expiringDocs: number;
  expiredDocs: number;
  manualCount: number;
  automaticCount: number;
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
    MatTooltipModule
  ],
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  vehicles: VehicleWithLicense[] = [];
  filteredVehicles: VehicleWithLicense[] = [];
  licenses: Map<number, string> = new Map();
  schoolId: number = 0;
  loading: boolean = true;

  // Search and filters
  searchTerm: string = '';
  selectedTransmissionFilter: string = 'ALL';
  private searchSubject = new Subject<string>();

  // Summary stats
  summaryStats: SummaryStats = {
    totalVehicles: 0,
    expiringDocs: 0,
    expiredDocs: 0,
    manualCount: 0,
    automaticCount: 0
  };

  // Enums for dropdowns
  transmissionTypes = Object.values(TransmissionType);
  fuelTypeOptions: FuelTypeOption[] = [
    { value: FuelType.BENZINA, viewValue: 'Benzină' },
    { value: FuelType.MOTORINA, viewValue: 'Motorină' },
    { value: FuelType.ELECTRIC, viewValue: 'Electric' },
    { value: FuelType.HIBRID, viewValue: 'Hibrid' },
    { value: FuelType.HIDROGEN, viewValue: 'Hidrogen' },
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

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getVehicles(this.schoolId)
      .pipe(
        switchMap(vehicles => {
          vehicles = vehicles.map(vehicle => ({
            ...vehicle,
            transmissionType: this.normalizeTransmissionType(vehicle.transmissionType)
          }));

          return this.licenseService.getLicenses().pipe(
            map(licenses => {
              const licenseMap = new Map<number, string>();
              licenses.forEach(license => {
                licenseMap.set(license.licenseId, license.type);
              });

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
          this.applyFilters();
          this.calculateSummaryStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          this.loading = false;
        }
      });
  }

  calculateSummaryStats(): void {
    this.summaryStats.totalVehicles = this.vehicles.length;
    
    let expiringCount = 0;
    let expiredCount = 0;
    let manualCount = 0;
    let automaticCount = 0;

    this.vehicles.forEach(vehicle => {
      // Count transmission types
      if (vehicle.transmissionType === 'MANUAL') {
        manualCount++;
      } else if (vehicle.transmissionType === 'AUTOMATIC') {
        automaticCount++;
      }

      // Count document status
      const docs = [vehicle.itpExpiryDate, vehicle.insuranceExpiryDate, vehicle.rcaExpiryDate];
      docs.forEach(docDate => {
        if (this.isDateExpired(docDate)) {
          expiredCount++;
        } else if (this.isDateExpiring(docDate)) {
          expiringCount++;
        }
      });
    });

    this.summaryStats.expiringDocs = expiringCount;
    this.summaryStats.expiredDocs = expiredCount;
    this.summaryStats.manualCount = manualCount;
    this.summaryStats.automaticCount = automaticCount;
  }

  // Search input handler
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  // Apply all filters
  applyFilters(): void {
    let result = [...this.vehicles];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(vehicle => {
        const plate = vehicle.licensePlateNumber?.toLowerCase() || '';
        const brand = vehicle.brand?.toLowerCase() || '';
        const model = vehicle.model?.toLowerCase() || '';
        const color = vehicle.color?.toLowerCase() || '';

        return plate.includes(term) ||
          brand.includes(term) ||
          model.includes(term) ||
          color.includes(term);
      });
    }

    // Apply transmission filter
    if (this.selectedTransmissionFilter !== 'ALL') {
      result = result.filter(v => v.transmissionType === this.selectedTransmissionFilter);
    }

    this.filteredVehicles = result;
  }

  setTransmissionFilter(type: string): void {
    this.selectedTransmissionFilter = type;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTransmissionFilter = 'ALL';
    this.applyFilters();
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
    const formattedData = {
      ...vehicleData,
      transmissionType: vehicleData.transmissionType ? vehicleData.transmissionType.toUpperCase() : '',
      itpExpiryDate: vehicleData.itpExpiryDate ? new Date(vehicleData.itpExpiryDate).toISOString() : null,
      insuranceExpiryDate: vehicleData.insuranceExpiryDate ? new Date(vehicleData.insuranceExpiryDate).toISOString() : null,
      rcaExpiryDate: vehicleData.rcaExpiryDate ? new Date(vehicleData.rcaExpiryDate).toISOString() : null
    };

    this.vehicleService.addVehicle(this.schoolId, formattedData)
      .subscribe({
        next: () => this.loadVehicles(),
        error: (error) => console.error('Error adding vehicle:', error)
      });
  }

  updateVehicle(vehicleId: number, vehicleData: any): void {
    const formattedData = {
      ...vehicleData,
      transmissionType: vehicleData.transmissionType ? vehicleData.transmissionType.toUpperCase() : '',
      itpExpiryDate: vehicleData.itpExpiryDate ? new Date(vehicleData.itpExpiryDate).toISOString() : null,
      insuranceExpiryDate: vehicleData.insuranceExpiryDate ? new Date(vehicleData.insuranceExpiryDate).toISOString() : null,
      rcaExpiryDate: vehicleData.rcaExpiryDate ? new Date(vehicleData.rcaExpiryDate).toISOString() : null
    };

    this.vehicleService.updateVehicle(vehicleId, formattedData)
      .subscribe({
        next: () => this.loadVehicles(),
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

  // Date checking methods
  isDateExpired(dateString: string | null): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isDateExpiring(dateString: string | null): boolean {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    expiryDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return !this.isDateExpired(dateString) && expiryDate <= thirtyDaysFromNow;
  }

  getDaysUntilExpiry(dateString: string | null): number {
    if (!dateString) return 999;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDocumentStatusClass(dateString: string | null): string {
    if (this.isDateExpired(dateString)) return 'text-red-600 font-bold';
    if (this.isDateExpiring(dateString)) return 'text-amber-600 font-semibold';
    return 'text-gray-700';
  }

  getDocumentBadgeClass(dateString: string | null): string {
    if (this.isDateExpired(dateString)) return 'bg-red-100 text-red-700';
    if (this.isDateExpiring(dateString)) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  }

  hasExpiringDocuments(): boolean {
    return this.vehicles.some(vehicle =>
      this.isDateExpiring(vehicle.itpExpiryDate) ||
      this.isDateExpiring(vehicle.insuranceExpiryDate) ||
      this.isDateExpiring(vehicle.rcaExpiryDate)
    );
  }

  hasExpiredDocuments(): boolean {
    return this.vehicles.some(vehicle =>
      this.isDateExpired(vehicle.itpExpiryDate) ||
      this.isDateExpired(vehicle.insuranceExpiryDate) ||
      this.isDateExpired(vehicle.rcaExpiryDate)
    );
  }

  getFuelTypeDisplay(value: string): string {
    const option = this.fuelTypeOptions.find(opt => opt.value === value);
    return option ? option.viewValue : value;
  }

  formatLicensePlate(licensePlate: string): string {
    if (!licensePlate) return '';
    const match = licensePlate.match(/^(AB|AG|AR|B|BC|BH|BN|BR|BT|BV|BZ|CJ|CL|CS|CT|CV|DB|DJ|GJ|GL|GR|HD|HR|IF|IL|IS|MH|MM|MS|NT|OT|PH|SB|SJ|SM|SV|TL|TM|TR|VL|VN|VS)([0-9]{2,3})([A-Z]{3})$/);
    if (match) {
      const [_, county, numbers, letters] = match;
      return `${county} ${numbers} ${letters}`;
    }
    return licensePlate;
  }

  normalizeTransmissionType(transmissionType: string): string {
    if (!transmissionType) return '';
    return transmissionType.toUpperCase();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  }
}
