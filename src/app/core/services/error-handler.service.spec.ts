import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService, ErrorType } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle network errors', () => {
    const httpError = new HttpErrorResponse({
      error: new ErrorEvent('Network error', { message: 'Internet disconnected' }),
      status: 0,
      statusText: 'Unknown Error'
    });

    service.handleHttpError(httpError).subscribe({
      error: (error) => {
        expect(error.type).toBe(ErrorType.NETWORK);
        expect(error.message).toBe('Internet disconnected');
      }
    });
  });

  it('should handle 401 auth errors', () => {
    const httpError = new HttpErrorResponse({
      error: { message: 'Invalid credentials' },
      status: 401,
      statusText: 'Unauthorized'
    });

    service.handleHttpError(httpError).subscribe({
      error: (error) => {
        expect(error.type).toBe(ErrorType.AUTH);
        expect(error.status).toBe(401);
      }
    });
  });
});
