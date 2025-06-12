import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import {
  ApplicationUserTeachingCategory,
  InstructorTeachingCategory,
  CreateApplicationUserTeachingCategoryRequest
} from '../../models/interfaces/teaching-category.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorTeachingCategoryService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  // Get all teaching categories for a specific instructor
  getInstructorTeachingCategories(schoolId: number, instructorId: string): Observable<ApplicationUserTeachingCategory[]> {
    return this.http.get<ApplicationUserTeachingCategory[]>(
      `${this.apiUrl}autoschool/${schoolId}/instructorCategories/instructor/${instructorId}/teachingCategories`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Get all instructors for a specific teaching category
  getTeachingCategoryInstructors(schoolId: number, teachingCategoryId: number): Observable<InstructorTeachingCategory[]> {
    return this.http.get<InstructorTeachingCategory[]>(
      `${this.apiUrl}autoschool/${schoolId}/instructorCategories/teachingCategory/${teachingCategoryId}/instructors`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Assign a teaching category to an instructor
  assignTeachingCategoryToInstructor(
    schoolId: number,
    request: CreateApplicationUserTeachingCategoryRequest
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}autoschool/${schoolId}/instructorCategories/create`,
      request
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Remove a teaching category from an instructor
  removeTeachingCategoryFromInstructor(
    schoolId: number,
    applicationUserTeachingCategoryId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}autoschool/${schoolId}/instructorCategories/delete/${applicationUserTeachingCategoryId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
