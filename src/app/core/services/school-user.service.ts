import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface SchoolUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolUserService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  /**
   * Get users of a specific type for a school
   * @param schoolId The school ID
   * @param role The role name: 'Instructor' or 'Student'
   */
  getSchoolUsers(schoolId: number, role: 'Instructor' | 'Student'): Observable<SchoolUser[]> {
    const url = this.configService.getApiUrl(`SchoolAdmin/autoschool/${schoolId}/getUsers/${role}`);
    return this.http.get<SchoolUser[]>(url);
  }

  // Get instructors for a school
  getSchoolInstructors(schoolId: number): Observable<SchoolUser[]> {
    return this.getSchoolUsers(schoolId, 'Instructor');
  }

  // Get students for a school
  getSchoolStudents(schoolId: number): Observable<SchoolUser[]> {
    return this.getSchoolUsers(schoolId, 'Student');
  }
}
