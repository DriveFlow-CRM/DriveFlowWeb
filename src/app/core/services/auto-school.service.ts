import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface County {
  countyId: number;
  name: string;
  abbreviation: string;
}

export interface City {
  cityId: number;
  name: string;
  county: County;
}

export interface Address {
  addressId: number;
  streetName: string;
  addressNumber: string;
  postcode: string;
  city: City;
}

export interface SchoolAdmin {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface AutoSchool {
  autoSchoolId: number;
  name: string;
  description: string;
  webSite: string;
  phoneNumber: string;
  email: string;
  status: 'active' | 'restricted' | 'demo';
  address: Address;
  addressId?: number;
  schoolAdmin: SchoolAdmin;
}

export interface CreateAutoSchoolRequest {
  autoSchool: {
    name: string;
    description: string;
    webSite: string;
    phoneNumber: string;
    email: string;
    status: 'active' | 'restricted' | 'demo';
    addressId: number;
  };
  schoolAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
}

export interface UpdateAutoSchoolRequest {
  name: string;
  description: string;
  webSite: string;
  phoneNumber: string;
  email: string;
  status: 'active' | 'restricted' | 'demo';
  addressId: number;
}

export interface UpdateSchoolAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutoSchoolService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get all auto schools
   */
  getAutoSchools(): Observable<AutoSchool[]> {
    return this.http.get<AutoSchool[]>(`${this.apiUrl}AutoSchool/get`);
  }

  /**
   * Create a new auto school with admin
   */
  createAutoSchool(request: CreateAutoSchoolRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}AutoSchool/create`, request);
  }

  /**
   * Update an existing auto school
   */
  updateAutoSchool(autoSchoolId: number, request: UpdateAutoSchoolRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}AutoSchool/update/${autoSchoolId}`, request);
  }

  /**
   * Delete an auto school
   */
  deleteAutoSchool(autoSchoolId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}AutoSchool/delete/${autoSchoolId}`);
  }

  /**
   * Update a school admin's details
   */
  updateSchoolAdmin(userId: string, request: UpdateSchoolAdminRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}AutoSchool/updateSchoolAdmin/${userId}`, request);
  }
}
