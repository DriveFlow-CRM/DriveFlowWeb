import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';

export interface StudentProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  cnp?: string;
  phone?: string;
  password?: string;
}

export interface StudentFileDto {
  fileId: number;
  status: string;
  scholarshipStartDate: string;
  criminalRecordExpiryDate: string;
  medicalRecordExpiryDate: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licensePlateNumber?: string;
  transmissionType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get all students for a school
  getStudents(schoolId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/getUsers/Student`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Create a new student with file and payment
  createStudent(schoolId: number, studentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/create/student`, studentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Update an existing student
  updateStudent(schoolId: number, userId: string, studentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/update/student/${userId}`, studentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Delete a student
  deleteStudent(schoolId: number, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/deleteUser/${userId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Update student profile (student endpoint)
  updateStudentProfile(studentData: StudentProfileUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}Student/updateProfile`, studentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Get student file details
  getStudentFile(studentId: number): Observable<StudentFileDto> {
    return this.http.get<StudentFileDto>(`${this.apiUrl}Student/${studentId}/file`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Get student assigned to a file
  getFileStudent(schoolId: number, fileId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}autoschool/${schoolId}/files/${fileId}/student`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Assign student to file
  assignStudentToFile(schoolId: number, fileId: number, studentId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}autoschool/${schoolId}/files/${fileId}/assignStudent`, { studentId })
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Remove student from file
  removeStudentFromFile(schoolId: number, fileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}autoschool/${schoolId}/files/${fileId}/removeStudent`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Register new student account
  registerStudentAccount(studentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Student/registerAccount`, studentData)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }
}
