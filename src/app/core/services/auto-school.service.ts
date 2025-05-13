import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import {
  AutoSchool,
  CreateAutoSchoolRequest,
  UpdateAutoSchoolRequest,
  UpdateSchoolAdminRequest
} from '../../models/interfaces/auto-school.model';

@Injectable({
  providedIn: 'root'
})
export class AutoSchoolService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get all auto schools
   */
  getAutoSchools(): Observable<AutoSchool[]> {
    return this.http.get<AutoSchool[]>(`${this.apiUrl}AutoSchool/get`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  /**
   * Create a new auto school with admin
   */
  createAutoSchool(request: CreateAutoSchoolRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}AutoSchool/create`, request)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  /**
   * Update an existing auto school
   */
  updateAutoSchool(autoSchoolId: number, request: UpdateAutoSchoolRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}AutoSchool/update/${autoSchoolId}`, request)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  /**
   * Delete an auto school
   */
  deleteAutoSchool(autoSchoolId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}AutoSchool/delete/${autoSchoolId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  /**
   * Update a school admin's details
   */
  updateSchoolAdmin(userId: string, request: UpdateSchoolAdminRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}AutoSchool/updateSchoolAdmin/${userId}`, request)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }
}
