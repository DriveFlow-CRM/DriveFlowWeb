import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService, NOTIFICATION_MESSAGES } from '../services/notification.service';
import { ErrorHandlerService, ErrorType, AppError } from '../services/error-handler.service';

/**
 * HTTP Error Interceptor
 * 
 * Centralized error handling for all HTTP requests.
 * - Transforms HTTP errors into AppError format
 * - Shows user-friendly notifications
 * - Skips 401 errors (handled by auth interceptor)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip 401 errors - they are handled by auth interceptor
      if (error.status === 401) {
        return throwError(() => error);
      }

      // Transform to AppError format
      const appError = transformHttpError(error);

      // Show notification based on error type
      showErrorNotification(notificationService, appError, error);

      // Re-throw the error for component-level handling
      return throwError(() => appError);
    })
  );
};

/**
 * Transform HttpErrorResponse to AppError format
 */
function transformHttpError(error: HttpErrorResponse): AppError {
  let message: string;
  let type: ErrorType;

  if (error.error instanceof ErrorEvent) {
    // Client-side error (network, etc.)
    message = NOTIFICATION_MESSAGES.NETWORK_ERROR;
    type = ErrorType.NETWORK;
  } else {
    // Server-side error
    switch (error.status) {
      case 0:
        message = NOTIFICATION_MESSAGES.NETWORK_ERROR;
        type = ErrorType.NETWORK;
        break;
      case 400:
        message = extractServerMessage(error) || NOTIFICATION_MESSAGES.VALIDATION_ERROR;
        type = ErrorType.VALIDATION;
        break;
      case 403:
        message = NOTIFICATION_MESSAGES.FORBIDDEN;
        type = ErrorType.AUTH;
        break;
      case 404:
        message = NOTIFICATION_MESSAGES.NOT_FOUND;
        type = ErrorType.SERVER;
        break;
      case 409:
        message = extractServerMessage(error) || 'Conflict: resursa există deja.';
        type = ErrorType.VALIDATION;
        break;
      case 422:
        message = extractServerMessage(error) || NOTIFICATION_MESSAGES.VALIDATION_ERROR;
        type = ErrorType.VALIDATION;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = NOTIFICATION_MESSAGES.SERVER_ERROR;
        type = ErrorType.SERVER;
        break;
      default:
        message = extractServerMessage(error) || NOTIFICATION_MESSAGES.GENERIC_ERROR;
        type = ErrorType.UNKNOWN;
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
 * Extract error message from server response
 */
function extractServerMessage(error: HttpErrorResponse): string | null {
  if (error.error) {
    // Common error response formats
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error.message) {
      return error.error.message;
    }
    if (error.error.error) {
      return error.error.error;
    }
    if (error.error.errors) {
      // Handle validation errors array
      const errors = error.error.errors;
      if (Array.isArray(errors)) {
        return errors.join(', ');
      }
      if (typeof errors === 'object') {
        return Object.values(errors).flat().join(', ');
      }
    }
    if (error.error.title) {
      return error.error.title;
    }
  }
  return null;
}

/**
 * Show appropriate notification based on error type
 */
function showErrorNotification(
  notificationService: NotificationService,
  appError: AppError,
  originalError: HttpErrorResponse
): void {
  // Don't show notification for certain cases
  const skipNotification = [
    // Skip if it's a silent/background request (could check for custom header)
  ];

  // Get Romanian message based on error type
  const message = getRomanianErrorMessage(appError, originalError);

  switch (appError.type) {
    case ErrorType.NETWORK:
      notificationService.showError(message, { duration: 6000 });
      break;
    case ErrorType.AUTH:
      notificationService.showWarning(message);
      break;
    case ErrorType.VALIDATION:
      notificationService.showWarning(message);
      break;
    case ErrorType.SERVER:
      notificationService.showError(message);
      break;
    default:
      notificationService.showError(message);
  }
}

/**
 * Get Romanian error message for display
 */
function getRomanianErrorMessage(appError: AppError, originalError: HttpErrorResponse): string {
  // Map common English error messages to Romanian
  const messageMap: Record<string, string> = {
    'Bad Request': NOTIFICATION_MESSAGES.VALIDATION_ERROR,
    'Not Found': NOTIFICATION_MESSAGES.NOT_FOUND,
    'Internal Server Error': NOTIFICATION_MESSAGES.SERVER_ERROR,
    'Forbidden': NOTIFICATION_MESSAGES.FORBIDDEN,
    'Unauthorized': NOTIFICATION_MESSAGES.UNAUTHORIZED,
    'Service Unavailable': NOTIFICATION_MESSAGES.SERVER_ERROR,
    'Gateway Timeout': NOTIFICATION_MESSAGES.SERVER_ERROR,
  };

  // Check if we have a Romanian translation for the message
  const translatedMessage = messageMap[appError.message];
  if (translatedMessage) {
    return translatedMessage;
  }

  // Return the original message (should already be Romanian from transformHttpError)
  return appError.message;
}
