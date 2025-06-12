import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import {
  Vehicle,
  TransmissionType,
  FuelType,
  PowertrainType,
  CreateVehicleRequest
} from '../../models/interfaces/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get all vehicles for a school
  getVehicles(schoolId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}Vehicle/get/${schoolId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Add a new vehicle
  addVehicle(schoolId: number, vehicleData: Partial<CreateVehicleRequest>): Observable<Vehicle> {
    // Format the data according to API requirements
    const requestBody: CreateVehicleRequest = {
      licensePlateNumber: vehicleData.licensePlateNumber || '',
      transmissionType: vehicleData.transmissionType || '',
      color: vehicleData.color || '',
      brand: vehicleData.brand || '',
      model: vehicleData.model || '',
      yearOfProduction: vehicleData.yearOfProduction || 0,
      fuelType: vehicleData.fuelType || '',
      engineSizeLiters: vehicleData.engineSizeLiters || 0,
      powertrainType: vehicleData.powertrainType || '',
      itpExpiryDate: vehicleData.itpExpiryDate || null,
      insuranceExpiryDate: vehicleData.insuranceExpiryDate || null,
      rcaExpiryDate: vehicleData.rcaExpiryDate || null,
      licenseId: vehicleData.licenseId || 0
    };

    return this.http.post<Vehicle>(`${this.apiUrl}Vehicle/create/${schoolId}`, requestBody)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Update an existing vehicle
  updateVehicle(vehicleId: number, vehicle: Omit<Vehicle, 'vehicleId'>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}Vehicle/update/${vehicleId}`, vehicle)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Delete a vehicle
  deleteVehicle(vehicleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}Vehicle/delete/${vehicleId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Helper methods to get enum values for dropdowns
  getTransmissionTypes(): string[] {
    return Object.values(TransmissionType);
  }

  getFuelTypes(): string[] {
    return Object.values(FuelType);
  }

  getPowertrainTypes(): string[] {
    return Object.values(PowertrainType);
  }
}
