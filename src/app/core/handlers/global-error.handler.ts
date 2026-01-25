import { ErrorHandler, Injectable, Injector, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService, NOTIFICATION_MESSAGES } from '../services/notification.service';

/**
 * Global error handler that catches all unhandled errors in the application.
 * Logs errors and shows user-friendly notifications.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  // Use Injector to avoid circular dependency with NotificationService
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    // Get NotificationService lazily to avoid circular dependency
    const notificationService = this.injector.get(NotificationService);

    let message: string;
    let stack: string | undefined;

    if (error instanceof HttpErrorResponse) {
      // Server-side error (HTTP error)
      message = this.getHttpErrorMessage(error);
      stack = undefined;
    } else {
      // Client-side error (JavaScript error)
      message = error.message || NOTIFICATION_MESSAGES.GENERIC_ERROR;
      stack = error.stack;
    }

    // Log error to console in development
    if (isDevMode()) {
      console.group('🔴 Global Error Handler');
      console.error('Error:', error);
      if (stack) {
        console.error('Stack trace:', stack);
      }
      console.groupEnd();
    } else {
      // In production, you would send to an error tracking service
      // Example: Sentry, LogRocket, etc.
      console.error('Error:', message);
    }

    // Show user-friendly notification
    // Don't show notification for 401 errors (handled by auth interceptor)
    if (!(error instanceof HttpErrorResponse && error.status === 401)) {
      notificationService.showError(this.getUserFriendlyMessage(error));
    }
  }

  /**
   * Get appropriate error message based on HTTP status code
   */
  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return NOTIFICATION_MESSAGES.NETWORK_ERROR;
      case 400:
        return error.error?.message || NOTIFICATION_MESSAGES.VALIDATION_ERROR;
      case 401:
        return NOTIFICATION_MESSAGES.UNAUTHORIZED;
      case 403:
        return NOTIFICATION_MESSAGES.FORBIDDEN;
      case 404:
        return NOTIFICATION_MESSAGES.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504:
        return NOTIFICATION_MESSAGES.SERVER_ERROR;
      default:
        return error.error?.message || NOTIFICATION_MESSAGES.GENERIC_ERROR;
    }
  }

  /**
   * Get user-friendly message for display in notification
   */
  private getUserFriendlyMessage(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      return this.getHttpErrorMessage(error);
    }

    // For client-side errors, don't expose technical details to users
    if (isDevMode()) {
      // In dev mode, show the actual error message
      return error.message || NOTIFICATION_MESSAGES.GENERIC_ERROR;
    }

    // In production, show a generic message
    return NOTIFICATION_MESSAGES.GENERIC_ERROR;
  }
}
