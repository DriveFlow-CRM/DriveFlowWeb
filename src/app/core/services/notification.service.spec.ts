import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NotificationService, NOTIFICATION_MESSAGES } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    // Create a mock for MatSnackBar
    snackBarSpy = {
      open: jest.fn(),
      dismiss: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showSuccess', () => {
    it('should show success notification with default config', () => {
      const message = 'Operațiune reușită!';
      service.showSuccess(message);

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        message,
        'OK',
        expect.objectContaining({
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-notification', 'snackbar-success']
        })
      );
    });

    it('should use custom duration when provided', () => {
      const message = 'Test message';
      service.showSuccess(message, { duration: 5000 });

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        message,
        'OK',
        expect.objectContaining({
          duration: 5000
        })
      );
    });
  });

  describe('showError', () => {
    it('should show error notification with default config', () => {
      const message = 'A apărut o eroare';
      service.showError(message);

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        message,
        'Închide',
        expect.objectContaining({
          duration: 5000,
          panelClass: ['snackbar-notification', 'snackbar-error']
        })
      );
    });
  });

  describe('showWarning', () => {
    it('should show warning notification with correct panel class', () => {
      const message = 'Atenție!';
      service.showWarning(message);

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        message,
        'OK',
        expect.objectContaining({
          duration: 4000,
          panelClass: ['snackbar-notification', 'snackbar-warning']
        })
      );
    });
  });

  describe('showInfo', () => {
    it('should show info notification with correct panel class', () => {
      const message = 'Informație importantă';
      service.showInfo(message);

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        message,
        'OK',
        expect.objectContaining({
          duration: 3000,
          panelClass: ['snackbar-notification', 'snackbar-info']
        })
      );
    });
  });

  describe('dismiss', () => {
    it('should dismiss the current snackbar', () => {
      service.dismiss();
      expect(snackBarSpy.dismiss).toHaveBeenCalled();
    });
  });

  describe('NOTIFICATION_MESSAGES', () => {
    it('should have all required message constants', () => {
      expect(NOTIFICATION_MESSAGES.GENERIC_ERROR).toBeDefined();
      expect(NOTIFICATION_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(NOTIFICATION_MESSAGES.UNAUTHORIZED).toBeDefined();
      expect(NOTIFICATION_MESSAGES.SAVE_SUCCESS).toBeDefined();
      expect(NOTIFICATION_MESSAGES.DELETE_SUCCESS).toBeDefined();
    });

    it('should have Romanian messages', () => {
      expect(NOTIFICATION_MESSAGES.NETWORK_ERROR).toContain('server');
      expect(NOTIFICATION_MESSAGES.SAVE_SUCCESS).toContain('succes');
    });
  });
});
