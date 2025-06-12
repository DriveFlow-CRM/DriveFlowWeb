import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import {
  TeachingCategory,
  CreateTeachingCategoryRequest,
  UpdateTeachingCategoryRequest
} from '../../models/interfaces/teaching-category.model';

export { TeachingCategory } from '../../models/interfaces/teaching-category.model';

@Injectable({
  providedIn: 'root'
})
export class TeachingCategoryService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get teaching categories for a specific school
   */
  getTeachingCategories(schoolId: number): Observable<TeachingCategory[]> {
    return this.http.get<TeachingCategory[]>(`${this.apiUrl}TeachingCategory/get/${schoolId}`)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }

  // Add a new teaching category
  addTeachingCategory(schoolId: number, teachingCategory: CreateTeachingCategoryRequest): Observable<TeachingCategory> {
    return this.http.post<TeachingCategory>(
      `${this.apiUrl}TeachingCategory/create/${schoolId}`,
      teachingCategory
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Update an existing teaching category
  updateTeachingCategory(
    schoolId: number,
    teachingCategoryId: number,
    teachingCategory: UpdateTeachingCategoryRequest
  ): Observable<TeachingCategory> {
    return this.http.put<TeachingCategory>(
      `${this.apiUrl}TeachingCategory/update/${schoolId}/${teachingCategoryId}`,
      teachingCategory
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  // Delete a teaching category
  deleteTeachingCategory(schoolId: number, teachingCategoryId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}TeachingCategory/delete/${schoolId}/${teachingCategoryId}`
    ).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }
}
