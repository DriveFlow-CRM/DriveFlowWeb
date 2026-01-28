import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';
import {
  SessionFormTemplate,
  SubmitSessionFormRequest,
  SessionFormResult
} from '../../models/interfaces/session-form.model';

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
   * Get the form template by license ID
   * @param licenseId The license ID (e.g., for license type A, B, C)
   */
  getFormByLicense(licenseId: number): Observable<SessionFormTemplate> {
    return this.http.get<SessionFormTemplate>(
      `${this.apiUrl}forms/by-license/${licenseId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
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
