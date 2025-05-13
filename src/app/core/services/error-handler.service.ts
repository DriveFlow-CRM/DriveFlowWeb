import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export enum ErrorType {
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  message: string;
  type: ErrorType;
  status?: number;
  details?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor() { }

  /**
   * Handles HTTP errors and returns a standardized error object
   */
  handleHttpError(error: HttpErrorResponse): Observable<never> {
    const appError = this.mapHttpErrorToAppError(error);

    // Log error to console in development
    console.error('API Error:', appError);

    return throwError(() => appError);
  }

  /**
   * Maps HTTP errors to application-specific error format
   */
  private mapHttpErrorToAppError(error: HttpErrorResponse): AppError {
    let message = 'An unexpected error occurred.';
    let type = ErrorType.UNKNOWN;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = error.error.message;
      type = ErrorType.NETWORK;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          message = 'Could not connect to the server. Please check your internet connection.';
          type = ErrorType.NETWORK;
          break;
        case 400:
          message = error.error?.message || 'Bad request';
          type = ErrorType.VALIDATION;
          break;
        case 401:
          message = 'Unauthorized. Please login again.';
          type = ErrorType.AUTH;
          break;
        case 403:
          message = 'You do not have permission to access this resource.';
          type = ErrorType.AUTH;
          break;
        case 404:
          message = 'The requested resource was not found.';
          type = ErrorType.SERVER;
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          type = ErrorType.SERVER;
          break;
        default:
          message = error.error?.message || `Error ${error.status}: ${error.statusText}`;
          type = ErrorType.SERVER;
      }
    }

    return {
      message,
      type,
      status: error.status,
      details: error.error,
      timestamp: new Date()
    };
  }

  /**
   * Handles application-level errors
   */
  handleAppError(error: Error, type: ErrorType = ErrorType.UNKNOWN): Observable<never> {
    const appError: AppError = {
      message: error.message,
      type,
      details: error.stack,
      timestamp: new Date()
    };

    console.error('Application Error:', appError);

    return throwError(() => appError);
  }
}
