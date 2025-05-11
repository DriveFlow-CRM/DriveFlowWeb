import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface License {
  licenseId: number;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get all licenses
   */
  getLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}License/get`);
  }

  /**
   * Create a new license
   */
  createLicense(license: { type: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}License/create`, license);
  }

  /**
   * Update an existing license
   */
  updateLicense(licenseId: number, license: { type: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}License/update/${licenseId}`, license);
  }

  /**
   * Delete a license
   */
  deleteLicense(licenseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}License/delete/${licenseId}`);
  }
}
