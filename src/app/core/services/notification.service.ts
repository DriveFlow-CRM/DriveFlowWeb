import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig {
  duration?: number;
  action?: string;
  position?: 'top' | 'bottom';
}

/**
 * Centralized notification service using Angular Material Snackbar.
 * All user-facing messages should be in Romanian.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly DEFAULT_DURATION_SUCCESS = 3000;
  private readonly DEFAULT_DURATION_ERROR = 5000;
  private readonly DEFAULT_DURATION_WARNING = 4000;
  private readonly DEFAULT_DURATION_INFO = 3000;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a success notification
   * @param message - Romanian message to display
   * @param config - Optional configuration
   */
  showSuccess(message: string, config?: NotificationConfig): void {
    this.show(message, 'success', {
      duration: config?.duration ?? this.DEFAULT_DURATION_SUCCESS,
      action: config?.action ?? 'OK',
      position: config?.position ?? 'bottom'
    });
  }

  /**
   * Show an error notification
   * @param message - Romanian message to display
   * @param config - Optional configuration
   */
  showError(message: string, config?: NotificationConfig): void {
    this.show(message, 'error', {
      duration: config?.duration ?? this.DEFAULT_DURATION_ERROR,
      action: config?.action ?? 'Închide',
      position: config?.position ?? 'bottom'
    });
  }

  /**
   * Show a warning notification
   * @param message - Romanian message to display
   * @param config - Optional configuration
   */
  showWarning(message: string, config?: NotificationConfig): void {
    this.show(message, 'warning', {
      duration: config?.duration ?? this.DEFAULT_DURATION_WARNING,
      action: config?.action ?? 'OK',
      position: config?.position ?? 'bottom'
    });
  }

  /**
   * Show an info notification
   * @param message - Romanian message to display
   * @param config - Optional configuration
   */
  showInfo(message: string, config?: NotificationConfig): void {
    this.show(message, 'info', {
      duration: config?.duration ?? this.DEFAULT_DURATION_INFO,
      action: config?.action ?? 'OK',
      position: config?.position ?? 'bottom'
    });
  }

  /**
   * Internal method to display the snackbar
   */
  private show(message: string, type: NotificationType, config: Required<NotificationConfig>): void {
    const snackBarConfig: MatSnackBarConfig = {
      duration: config.duration,
      horizontalPosition: 'center',
      verticalPosition: config.position,
      panelClass: this.getPanelClass(type)
    };

    this.snackBar.open(message, config.action, snackBarConfig);
  }

  /**
   * Get CSS class based on notification type
   */
  private getPanelClass(type: NotificationType): string[] {
    const baseClass = 'snackbar-notification';
    switch (type) {
      case 'success':
        return [baseClass, 'snackbar-success'];
      case 'error':
        return [baseClass, 'snackbar-error'];
      case 'warning':
        return [baseClass, 'snackbar-warning'];
      case 'info':
        return [baseClass, 'snackbar-info'];
      default:
        return [baseClass];
    }
  }

  /**
   * Dismiss the current snackbar
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}

/**
 * Common Romanian error messages for user-facing notifications.
 * Use these constants for consistent messaging throughout the app.
 */
export const NOTIFICATION_MESSAGES = {
  // Generic errors
  GENERIC_ERROR: 'A apărut o eroare. Vă rugăm încercați din nou.',
  NETWORK_ERROR: 'Nu s-a putut conecta la server. Verificați conexiunea la internet.',
  UNAUTHORIZED: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.',
  FORBIDDEN: 'Nu aveți permisiunea de a accesa această resursă.',
  NOT_FOUND: 'Resursa solicitată nu a fost găsită.',
  SERVER_ERROR: 'Eroare de server. Vă rugăm încercați mai târziu.',
  VALIDATION_ERROR: 'Date invalide. Verificați câmpurile și încercați din nou.',

  // Success messages
  SAVE_SUCCESS: 'Datele au fost salvate cu succes.',
  DELETE_SUCCESS: 'Ștergerea a fost efectuată cu succes.',
  UPDATE_SUCCESS: 'Actualizarea a fost efectuată cu succes.',
  CREATE_SUCCESS: 'Înregistrarea a fost creată cu succes.',

  // Auth messages
  LOGIN_SUCCESS: 'Autentificare reușită. Bine ați venit!',
  LOGOUT_SUCCESS: 'V-ați deconectat cu succes.',
  PASSWORD_CHANGED: 'Parola a fost schimbată cu succes.',

  // Form messages
  FORM_INVALID: 'Formularul conține erori. Verificați câmpurile marcate.',
  REQUIRED_FIELDS: 'Completați toate câmpurile obligatorii.',

  // Loading messages
  LOADING: 'Se încarcă...',
  PLEASE_WAIT: 'Vă rugăm așteptați...'
} as const;
