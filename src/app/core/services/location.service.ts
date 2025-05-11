import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { County, City, Address } from './auto-school.service';

export interface CountyCreateDto {
  name: string;
  abbreviation: string;
}

export interface CityCreateDto {
  name: string;
  countyId: number;
}

export interface AddressCreateDto {
  streetName: string;
  addressNumber: string;
  postcode: string;
  cityId: number;
}

export interface AddressUpdateDto {
  streetName: string;
  addressNumber: string;
  postcode: string;
  cityId: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // County API methods
  getCounties(): Observable<County[]> {
    return this.http.get<County[]>(`${this.apiUrl}County/get`);
  }

  createCounty(county: CountyCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}County`, county);
  }

  deleteCounty(countyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}County/${countyId}`);
  }

  // City API methods
  getCities(countyId?: number): Observable<City[]> {
    let url = `${this.apiUrl}City`;
    if (countyId) {
      url += `?countyId=${countyId}`;
    }
    return this.http.get<City[]>(url);
  }

  createCity(city: CityCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}City/create`, city);
  }

  deleteCity(cityId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}City/${cityId}`);
  }

  // Address API methods
  getAddresses(cityId?: number): Observable<Address[]> {
    let url = `${this.apiUrl}Address/get`;
    if (cityId) {
      url += `?cityId=${cityId}`;
    }
    return this.http.get<Address[]>(url);
  }

  createAddress(address: AddressCreateDto): Observable<any> {
    return this.http.post(`${this.apiUrl}Address/create`, address);
  }

  updateAddress(addressId: number, address: AddressUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}Address/update/${addressId}`, address);
  }

  deleteAddress(addressId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}Address/delete/${addressId}`);
  }
}
