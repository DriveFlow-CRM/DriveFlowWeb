import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  params?: HttpParams | { [param: string]: string | string[] };
  headers?: HttpHeaders | { [header: string]: string | string[] };
}

/**
 * Abstract base class for API services.
 * Provides common HTTP methods with built-in error handling.
 * 
 * Usage:
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class MyService extends BaseApiService {
 *   constructor(http: HttpClient, config: ConfigService, errorHandler: ErrorHandlerService) {
 *     super(http, config, errorHandler);
 *   }
 * 
 *   getItems(): Observable<Item[]> {
 *     return this.get<Item[]>('items');
 *   }
 * }
 * ```
 */
export abstract class BaseApiService {
  protected readonly apiUrl: string;

  constructor(
    protected http: HttpClient,
    protected config: ConfigService,
    protected errorHandler: ErrorHandlerService
  ) {
    this.apiUrl = config.getApiBaseUrl();
  }

  /**
   * Build full URL from endpoint
   */
  protected buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.apiUrl}${cleanEndpoint}`;
  }

  /**
   * GET request
   * @param endpoint API endpoint (relative to base URL)
   * @param options Optional request options
   */
  protected get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), options).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * POST request
   * @param endpoint API endpoint (relative to base URL)
   * @param body Request body
   * @param options Optional request options
   */
  protected post<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, options).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * PUT request
   * @param endpoint API endpoint (relative to base URL)
   * @param body Request body
   * @param options Optional request options
   */
  protected put<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, options).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * PATCH request
   * @param endpoint API endpoint (relative to base URL)
   * @param body Request body
   * @param options Optional request options
   */
  protected patch<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, options).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * DELETE request
   * @param endpoint API endpoint (relative to base URL)
   * @param options Optional request options
   */
  protected delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options).pipe(
      catchError(error => this.errorHandler.handleHttpError(error))
    );
  }

  /**
   * Build HttpParams from object
   * @param params Object with key-value pairs
   */
  protected buildParams(params: Record<string, string | number | boolean | undefined | null>): HttpParams {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    
    return httpParams;
  }
}
