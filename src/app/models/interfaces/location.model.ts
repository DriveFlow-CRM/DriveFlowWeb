/**
 * Location-related models and DTOs
 * Used for County, City, and Address management
 */

// Re-export from auto-school.model for backward compatibility
export { County, City, Address } from './auto-school.model';

/**
 * DTO for creating a new county
 */
export interface CountyCreateDto {
  name: string;
  abbreviation: string;
}

/**
 * DTO for updating a county
 */
export interface CountyUpdateDto {
  name: string;
  abbreviation: string;
}

/**
 * DTO for creating a new city
 */
export interface CityCreateDto {
  name: string;
  countyId: number;
}

/**
 * DTO for updating a city
 */
export interface CityUpdateDto {
  name: string;
  countyId: number;
}

/**
 * DTO for creating a new address
 */
export interface AddressCreateDto {
  streetName: string;
  addressNumber: string;
  postcode: string;
  cityId: number;
}

/**
 * DTO for updating an address
 */
export interface AddressUpdateDto {
  streetName: string;
  addressNumber: string;
  postcode: string;
  cityId: number;
}
