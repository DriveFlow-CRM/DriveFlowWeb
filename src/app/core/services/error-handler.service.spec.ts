import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService, ErrorType, AppError } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlerService]
    });

    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleHttpError', () => {
    it('should handle 401 unauthorized error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized'
      });

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.type).toBe(ErrorType.AUTH);
          expect(error.status).toBe(401);
          expect(error.message).toContain('Unauthorized');
          done();
        }
      });
    });

    it('should handle 403 forbidden error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden'
      });

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.type).toBe(ErrorType.AUTH);
          expect(error.status).toBe(403);
          done();
        }
      });
    });

    it('should handle 404 not found error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.type).toBe(ErrorType.SERVER);
          expect(error.status).toBe(404);
          done();
        }
      });
    });

    it('should handle 400 validation error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid input data' }
      });

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.type).toBe(ErrorType.VALIDATION);
          expect(error.status).toBe(400);
          expect(error.message).toBe('Invalid input data');
          done();
        }
      });
    });

    it('should handle 500 server error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.type).toBe(ErrorType.SERVER);
          expect(error.status).toBe(500);
          done();
        }
      });
    });

    it('should handle network error (status 0)', (done) => {
      const httpError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error'
      });

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.type).toBe(ErrorType.NETWORK);
          expect(error.status).toBe(0);
          done();
        }
      });
    });

    it('should include timestamp in error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      const beforeTime = new Date();

      service.handleHttpError(httpError).subscribe({
        error: (error: AppError) => {
          expect(error.timestamp).toBeDefined();
          expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
          done();
        }
      });
    });
  });

  describe('handleAppError', () => {
    it('should handle application errors', (done) => {
      const jsError = new Error('Something went wrong');

      service.handleAppError(jsError, ErrorType.UNKNOWN).subscribe({
        error: (error: AppError) => {
          expect(error.message).toBe('Something went wrong');
          expect(error.type).toBe(ErrorType.UNKNOWN);
          expect(error.timestamp).toBeDefined();
          done();
        }
      });
    });

    it('should include stack trace in details', (done) => {
      const jsError = new Error('Test error');

      service.handleAppError(jsError).subscribe({
        error: (error: AppError) => {
          expect(error.details).toBeDefined();
          done();
        }
      });
    });
  });
});
