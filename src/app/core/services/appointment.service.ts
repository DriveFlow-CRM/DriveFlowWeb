import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';

export interface CreateAppointmentDto {
  date: string; // format: date-time
  startHour: string; // HH:mm format
  endHour: string; // HH:mm format
  fileId: number;
}

export interface UpdateAppointmentDto {
  date: string; // format: date-time
  startHour: string; // HH:mm format
  endHour: string; // HH:mm format
}

export interface AppointmentDto {
  appointmentId: number;
  date: string;
  startHour: string;
  endHour: string;
  status: string;
  fileId: number;
  firstName?: string;
  lastName?: string;
  phoneNo?: string;
  licensePlateNumber?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get appointments for a specific student
  getStudentAppointments(studentId: string): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.apiUrl}Appointment/student/${studentId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Get all appointments for an instructor within a date range
  getInstructorAppointments(instructorId: string, startDate: string, endDate: string): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(
      `${this.apiUrl}instructor/${instructorId}/fetchInstructorAppointments/${startDate}/${endDate}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Create a new appointment
  createAppointment(appointmentData: CreateAppointmentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}Appointment/create`, appointmentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Update an existing appointment
  updateAppointment(appointmentId: number, appointmentData: UpdateAppointmentDto): Observable<any> {
    return this.http.put(`${this.apiUrl}Appointment/update/${appointmentId}`, appointmentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Delete an appointment
  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}Appointment/delete/${appointmentId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Get all appointments for a specific student (alternative endpoint)
  getStudentAppointmentsAlternative(studentId: number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.apiUrl}Student/${studentId}/appointments`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }
}
