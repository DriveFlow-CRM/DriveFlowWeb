import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { SchoolRequest } from '../../models/interfaces/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private errorHandler: ErrorHandlerService
  ) { }

  // Fetch all requests for a specific school
  fetchSchoolRequests(autoSchoolId: number): Observable<SchoolRequest[]> {
    const url = this.configService.getApiUrl(`request/school/${autoSchoolId}/fetchSchoolRequests`);
    return this.http.get<SchoolRequest[]>(url)
      .pipe(
        catchError(error => this.errorHandler.handleHttpError(error))
      );
  }
}
