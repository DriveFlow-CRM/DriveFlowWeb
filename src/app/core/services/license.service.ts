import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';

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
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get all licenses
   */
  getLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}License/get`).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Create a new license
   */
  createLicense(license: { type: string }): Observable<License> {
    return this.http.post<License>(`${this.apiUrl}License/create`, license).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Update an existing license
   */
  updateLicense(licenseId: number, license: { type: string }): Observable<License> {
    return this.http.put<License>(`${this.apiUrl}License/update/${licenseId}`, license).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Delete a license
   */
  deleteLicense(licenseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}License/delete/${licenseId}`).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
