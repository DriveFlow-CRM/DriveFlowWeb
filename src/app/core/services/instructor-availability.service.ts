import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import {
  InstructorAvailability,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
  InstructorAppointment,
  InstructorAssignedFile,
  FileDetails
} from '../../models/interfaces/instructor-availability.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorAvailabilityService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get instructor availability
  getInstructorAvailability(instructorId: string): Observable<InstructorAvailability[]> {
    return this.http.get<InstructorAvailability[]>(
      `${this.apiUrl}instructor-availability/${instructorId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Add new availability
  addAvailability(instructorId: string, availability: CreateAvailabilityRequest): Observable<InstructorAvailability> {
    return this.http.post<InstructorAvailability>(
      `${this.apiUrl}instructor-availability/${instructorId}`,
      availability
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Update existing availability
  updateAvailability(instructorId: string, intervalId: number, availability: UpdateAvailabilityRequest): Observable<InstructorAvailability> {
    return this.http.put<InstructorAvailability>(
      `${this.apiUrl}instructor-availability/${instructorId}/${intervalId}`,
      availability
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Delete availability
  deleteAvailability(instructorId: string, intervalId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}instructor-availability/${instructorId}/${intervalId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get instructor assigned files
  getInstructorAssignedFiles(instructorId: string): Observable<InstructorAssignedFile[]> {
    return this.http.get<InstructorAssignedFile[]>(
      `${this.apiUrl}instructor/${instructorId}/fetchInstructorAssignedFiles`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get file details
  getFileDetails(fileId: number): Observable<FileDetails> {
    return this.http.get<FileDetails>(
      `${this.apiUrl}instructor/fetchFileDetails/${fileId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get instructor appointments
  getInstructorAppointments(instructorId: string, startDate: string, endDate: string): Observable<InstructorAppointment[]> {
    return this.http.get<InstructorAppointment[]>(
      `${this.apiUrl}instructor/${instructorId}/fetchInstructorAppointments/${startDate}/${endDate}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
