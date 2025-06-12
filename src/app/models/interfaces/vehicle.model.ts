// Vehicle Models

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC'
}

export enum FuelType {
  BENZINA = 'BENZINA',    // PETROL
  MOTORINA = 'MOTORINA',  // DIESEL
  ELECTRIC = 'ELECTRIC',  // ELECTRIC
  HIBRID = 'HIBRID',      // HYBRID
  HIDROGEN = 'HIDROGEN',  // HYDROGEN
  GNC = 'GNC'             // CNG (Compressed Natural Gas)
}

export enum PowertrainType {
  COMBUSTIBIL = 'COMBUSTIBIL',  // FUEL (pure combustion engine)
  HIBRID = 'HIBRID',            // HYBRID
  ELECTRIC = 'ELECTRIC'         // ELECTRIC (fully electric)
}

export interface Vehicle {
  vehicleId: number;
  licensePlateNumber: string;
  transmissionType: string;
  color: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  fuelType: string;
  engineSizeLiters: number;
  powertrainType: string;
  itpExpiryDate: string | null;
  insuranceExpiryDate: string | null;
  rcaExpiryDate: string | null;
  licenseId: number;
}

export interface License {
  licenseId: number;
  licenseType: string;
}

export interface CreateVehicleRequest {
  licensePlateNumber: string;
  transmissionType: string;
  color: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  fuelType: string;
  engineSizeLiters: number;
  powertrainType: string;
  itpExpiryDate: string | null;
  insuranceExpiryDate: string | null;
  rcaExpiryDate: string | null;
  licenseId: number;
}

export interface UpdateVehicleRequest {
  licensePlateNumber: string;
  transmissionType: string;
  color: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  fuelType: string;
  engineSizeLiters: number;
  powertrainType: string;
  itpExpiryDate: string | null;
  insuranceExpiryDate: string | null;
  rcaExpiryDate: string | null;
  licenseId: number;
}
