import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigService } from './config.service';
import { School, TeachingCategory } from '../models/school.model';
import { EnrollmentForm } from '../models/enrollment.model';
import { SchoolStatus } from '../types/school.types';

// Define the interface for the schools listing API response
export interface SchoolListing {
  id: number;
  name: string;
  description: string;
  status: SchoolStatus;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getApiBaseUrl();
  }

  /**
   * Get schools listing for the landing page
   */
  getSchoolsListing(): Observable<SchoolListing[]> {
    return this.http.get<SchoolListing[]>(`${this.baseUrl}schoolspage/schools`);
  }

  /**
   * Get all schools
   */
  getAllSchools(): Observable<School[]> {
    return this.http.get<School[]>(`${this.baseUrl}schoolspage/schools`).pipe(
      map(schools => schools.map(school => this.mapApiResponseToSchool(school)))
    );
  }

  /**
   * Get school by ID
   */
  getSchoolById(id: string): Observable<School> {
    return this.http.get<School>(`${this.baseUrl}schoolspage/schools/${id}`).pipe(
      map(school => this.mapApiResponseToSchool(school))
    );
  }

  /**
   * Submit enrollment form
   */
  submitEnrollment(form: EnrollmentForm): Observable<any> {
    return this.http.post(`${this.baseUrl}enrollments`, form);
  }

  /**
   * Generate a URL-friendly slug for a school
   */
  generateSlug(school: School): string {
    return school.name.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Map API response to School model, ensuring backward compatibility with existing components
   */
  private mapApiResponseToSchool(school: School): School {
    const result: School = {
      ...school,
      // Ensure required properties have default values
      autoSchoolId: school.autoSchoolId || 0,
      name: school.name || '',
      city: school.address?.city || '',
      county: school.address?.county || '',
      status: school.status || 'inactive',
      description: school.description || '',
      email: school.email || '',
      // Legacy fields for backward compatibility
      id: school.autoSchoolId?.toString() || '0',
      state: school.address?.county || '',
      zip: school.address?.postcode || '',
      phone: school.phoneNumber || '',
      website: school.website || school.webSite || ''
    };

    return result;
  }
}
