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

// Stats interfaces
export interface MistakeTopItem {
  id_item: number;
  count: number;
}

export interface MistakeSeries {
  date: string;
  totalPoints: number;
  topItems: MistakeTopItem[];
}

export interface MistakeHeatmap {
  items: number[];
  sessions: number[];
  counts: number[][];
}

export interface MovingAverage {
  date: string;
  avg: number;
}

export interface MistakeStats {
  series: MistakeSeries[];
  heatmap: MistakeHeatmap;
  movingAverage: MovingAverage[];
}

export interface FileStats {
  fileId: number;
  stats: MistakeStats;
}

// Session Form interfaces
export interface SessionFormSummary {
  id: number;
  date: string;
  totalPoints: number;
  maxPoints: number;
  result: 'PASSED' | 'FAILED' | string;
}

export interface SessionFormMistake {
  id_item: number;
  description: string;
  count: number;
  penaltyPoints: number;
}

export interface SessionFormDetails {
  id: number;
  appointmentDate: string;
  studentName: string;
  instructorName: string;
  totalPoints: number;
  maxPoints: number;
  result: 'PASSED' | 'FAILED' | string;
  mistakes: SessionFormMistake[];
  isLocked: boolean;
}

export interface SessionFormsPaginatedResponse {
  page: number;
  pageSize: number;
  total: number;
  items: SessionFormSummary[];
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

  // Get mistake stats for a student
  getMistakeStats(
    studentId: string, 
    options?: { from?: string; to?: string; fileId?: number }
  ): Observable<FileStats[] | MistakeStats> {
    let params = new HttpParams();
    
    if (options?.from) {
      params = params.set('from', options.from);
    }
    if (options?.to) {
      params = params.set('to', options.to);
    }
    if (options?.fileId) {
      params = params.set('fileId', options.fileId.toString());
    }

    return this.http.get<FileStats[] | MistakeStats>(
      `${this.apiUrl}student/${studentId}/stats/mistakes`,
      { params }
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get session forms for a student
  getSessionForms(
    studentId: string,
    options?: { from?: string; to?: string; page?: number; pageSize?: number; fileId?: number }
  ): Observable<SessionFormsPaginatedResponse | SessionFormSummary[]> {
    let params = new HttpParams();
    
    if (options?.from) {
      params = params.set('from', options.from);
    }
    if (options?.to) {
      params = params.set('to', options.to);
    }
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.pageSize) {
      params = params.set('pageSize', options.pageSize.toString());
    }
    if (options?.fileId) {
      params = params.set('fileId', options.fileId.toString());
    }

    return this.http.get<SessionFormsPaginatedResponse | SessionFormSummary[]>(
      `${this.apiUrl}students/${studentId}/session-forms`,
      { params }
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get session form details by ID
  getSessionFormDetails(formId: number): Observable<SessionFormDetails> {
    return this.http.get<SessionFormDetails>(
      `${this.apiUrl}session-forms/${formId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
