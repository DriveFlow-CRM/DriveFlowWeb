import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';
import {
  County,
  City,
  Address,
  CountyCreateDto,
  CityCreateDto,
  AddressCreateDto,
  AddressUpdateDto
} from '../../models/interfaces/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // County API methods
  getCounties(): Observable<County[]> {
    return this.http.get<County[]>(`${this.apiUrl}County/get`).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  createCounty(county: CountyCreateDto): Observable<County> {
    return this.http.post<County>(`${this.apiUrl}County`, county).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  deleteCounty(countyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}County/${countyId}`).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // City API methods
  getCities(countyId?: number): Observable<City[]> {
    let url = `${this.apiUrl}City`;
    if (countyId) {
      url += `?countyId=${countyId}`;
    }
    return this.http.get<City[]>(url).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  createCity(city: CityCreateDto): Observable<City> {
    return this.http.post<City>(`${this.apiUrl}City/create`, city).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  deleteCity(cityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}City/${cityId}`).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Address API methods
  getAddresses(cityId?: number): Observable<Address[]> {
    let url = `${this.apiUrl}Address/get`;
    if (cityId) {
      url += `?cityId=${cityId}`;
    }
    return this.http.get<Address[]>(url).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  createAddress(address: AddressCreateDto): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}Address/create`, address).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  updateAddress(addressId: number, address: AddressUpdateDto): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}Address/update/${addressId}`, address).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}Address/delete/${addressId}`).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
