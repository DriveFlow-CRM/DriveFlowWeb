import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * HTTP Loading Interceptor
 * 
 * Automatically shows/hides the loading bar during HTTP requests.
 * Handles concurrent requests by counting active requests.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loading indicator for certain requests
  const skipLoading = req.headers.has('X-Skip-Loading');
  
  if (skipLoading) {
    return next(req);
  }

  // Start loading
  loadingService.startLoading();

  return next(req).pipe(
    finalize(() => {
      // Stop loading when request completes (success or error)
      loadingService.stopLoading();
    })
  );
};
