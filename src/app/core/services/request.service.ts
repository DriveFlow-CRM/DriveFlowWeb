import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface SchoolRequest {
  requestId: number;
  firstName: string;
  lastName: string;
  phoneNr: string;
  drivingCategory: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  // Fetch all requests for a specific school
  fetchSchoolRequests(autoSchoolId: number): Observable<SchoolRequest[]> {
    const url = this.configService.getApiUrl(`request/school/${autoSchoolId}/fetchSchoolRequests`);
    return this.http.get<SchoolRequest[]>(url);
  }
}
