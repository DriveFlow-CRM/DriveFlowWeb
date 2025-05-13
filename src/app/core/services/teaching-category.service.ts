import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface TeachingCategory {
  teachingCategoryId: number;
  licenseId: number;
  licenseType: string;
  sessionCost: number;
  sessionDuration: number;
  scholarshipPrice: number;
  minDrivingLessonsReq: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeachingCategoryService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  /**
   * Get teaching categories for a specific school
   */
  getTeachingCategories(schoolId: number): Observable<TeachingCategory[]> {
    const url = this.configService.getApiUrl(`TeachingCategory/get/${schoolId}`);
    return this.http.get<TeachingCategory[]>(url);
  }
}
