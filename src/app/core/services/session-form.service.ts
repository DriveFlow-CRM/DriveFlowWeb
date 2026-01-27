import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';
import {
  SessionFormTemplate,
  SubmitSessionFormRequest,
  SessionFormResult
} from '../../models/interfaces/session-form.model';

interface FileTeachingCategory {
  teachingCategoryId: number;
  licenseType: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionFormService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get the form template by teaching category ID
   * @param categoryId The teaching category ID (e.g., for license type A, B, C)
   */
  getFormByCategory(categoryId: number): Observable<SessionFormTemplate> {
    return this.http.get<SessionFormTemplate>(
      `${this.apiUrl}forms/by-category/${categoryId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Get the teaching category ID for a file
   * @param fileId The file ID
   */
  getFileCategoryId(fileId: number): Observable<number> {
    return this.http.get<any>(
      `${this.apiUrl}File/${fileId}`
    ).pipe(
      map(file => file.teachingCategory?.teachingCategoryId || file.teachingCategoryId || 1),
      catchError(() => of(1)) // Default to 1 if error
    );
  }

  /**
   * Get the form template for a file by first getting its category
   * @param fileId The file ID
   */
  getFormByFileId(fileId: number): Observable<SessionFormTemplate> {
    return this.getFileCategoryId(fileId).pipe(
      switchMap(categoryId => this.getFormByCategory(categoryId))
    );
  }

  /**
   * Submit a session form for an appointment
   * Only the instructor who owns the appointment can submit
   * Only one form allowed per appointment (409 Conflict if already exists)
   * @param appointmentId The appointment ID
   * @param formData The form submission data with mistakes
   */
  submitSessionForm(appointmentId: number, formData: SubmitSessionFormRequest): Observable<SessionFormResult> {
    return this.http.post<SessionFormResult>(
      `${this.apiUrl}session-forms/${appointmentId}/submit`,
      formData
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Check if a session form already exists for an appointment
   * @param appointmentId The appointment ID
   */
  checkFormExists(appointmentId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}session-forms/${appointmentId}/exists`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
