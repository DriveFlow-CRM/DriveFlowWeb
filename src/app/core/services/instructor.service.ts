import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import {
  Instructor,
  CreateInstructorRequest,
  UpdateInstructorRequest,
  InstructorDetails
} from '../../models/interfaces/instructor.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get all instructors for a school
  getInstructors(schoolId: number): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(
      `${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/getUsers/Instructor`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get details for a specific instructor
  getInstructorDetails(schoolId: number, instructorId: string): Observable<InstructorDetails> {
    return this.http.get<InstructorDetails>(
      `${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/getUser/${instructorId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Add a new instructor
  addInstructor(schoolId: number, instructor: CreateInstructorRequest): Observable<Instructor> {
    return this.http.post<Instructor>(
      `${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/create/instructor`,
      instructor
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Update an existing instructor
  updateInstructor(
    schoolId: number,
    instructorId: string,
    instructor: UpdateInstructorRequest
  ): Observable<Instructor> {
    return this.http.put<Instructor>(
      `${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/update/instructor/${instructorId}`,
      instructor
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Delete an instructor
  deleteInstructor(schoolId: number, instructorId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}SchoolAdmin/autoschool/${schoolId}/deleteUser/${instructorId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
