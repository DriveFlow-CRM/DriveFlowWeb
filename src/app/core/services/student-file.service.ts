import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { StudentFile, StudentFileDetails } from '../../models/interfaces/student-file.model';

export interface AvailableSlot {
  startHour: string;
  endHour: string;
}

export interface AvailableSlotsResponse {
  sessionDuration: number;
  availableSlots: AvailableSlot[];
}

export interface CreateFileAppointmentDto {
  date: string; // YYYY-MM-DD format
  startHour: string; // HH:mm format
  endHour: string; // HH:mm format
}

@Injectable({
  providedIn: 'root'
})
export class StudentFileService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get all files for a student
  getStudentFiles(studentId: string): Observable<StudentFile[]> {
    return this.http.get<StudentFile[]>(`${this.apiUrl}student/${studentId}/files`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Get details for a specific file
  getFileDetails(fileId: number): Observable<StudentFileDetails> {
    return this.http.get<StudentFileDetails>(`${this.apiUrl}student/file-details/${fileId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Get invoice for a file
  getFileInvoice(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}accounting/file/${fileId}/invoice`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get available slots for a specific date
  getAvailableSlots(fileId: number, date?: string): Observable<AvailableSlotsResponse> {
    let params = new HttpParams();

    // If no date provided, use tomorrow to avoid past dates error
    if (!date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    params = params.set('date', date);

    return this.http.get<AvailableSlotsResponse>(`${this.apiUrl}student/files/${fileId}/available-slots`, { params })
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Create appointment for a file
  createFileAppointment(fileId: number, appointmentData: CreateFileAppointmentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}student/files/${fileId}/appointments`, appointmentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }
}
