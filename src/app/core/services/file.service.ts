import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get all files for a school
  getAllFiles(schoolId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}file/fetchAll/${schoolId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Create a new file for a student
  createFile(studentId: string, fileData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}file/createFile/${studentId}`, fileData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Edit an existing file
  editFile(fileId: number, fileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}file/editFile/${fileId}`, fileData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Edit a payment
  editPayment(paymentId: number, paymentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}file/editPayment/${paymentId}`, paymentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Delete a file
  deleteFile(fileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}file/delete/${fileId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }
}
