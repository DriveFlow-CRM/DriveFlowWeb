import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard dialog sizes for consistent UI
 */
export enum DialogSize {
  SMALL = '400px',
  MEDIUM = '600px',
  LARGE = '800px',
  EXTRA_LARGE = '1000px',
  FULL_WIDTH = '95vw'
}

/**
 * Dialog configuration options
 */
export interface DialogOptions<D = unknown> {
  /** Dialog size preset or custom width */
  size?: DialogSize | string;
  /** Data to pass to the dialog component */
  data?: D;
  /** Whether clicking the backdrop closes the dialog */
  disableClose?: boolean;
  /** Custom CSS class for the dialog panel */
  panelClass?: string | string[];
  /** Auto-focus behavior */
  autoFocus?: boolean;
  /** Maximum height of the dialog */
  maxHeight?: string;
}

/**
 * Confirmation dialog options
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
}

/**
 * Centralized dialog service for consistent dialog management.
 * Provides standardized sizing, confirmation dialogs, and a simpler API.
 * 
 * Usage:
 * ```typescript
 * // Open a component dialog
 * this.dialogService.open(MyDialogComponent, {
 *   size: DialogSize.MEDIUM,
 *   data: { id: 123 }
 * });
 * 
 * // Show confirmation dialog
 * this.dialogService.confirm({
 *   title: 'Confirmare ștergere',
 *   message: 'Sigur doriți să ștergeți această înregistrare?'
 * }).subscribe(confirmed => {
 *   if (confirmed) { ... }
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly DEFAULT_SIZE = DialogSize.MEDIUM;

  constructor(private dialog: MatDialog) {}

  /**
   * Open a dialog with standardized configuration
   * @param component The component to open in the dialog
   * @param options Dialog configuration options
   */
  open<T, D = unknown, R = unknown>(
    component: ComponentType<T>,
    options: DialogOptions<D> = {}
  ): MatDialogRef<T, R> {
    const config = this.buildConfig(options);
    return this.dialog.open<T, D, R>(component, config);
  }

  /**
   * Show a confirmation dialog
   * @param data Confirmation dialog data
   * @returns Observable that emits true if confirmed, false otherwise
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    // Import the confirmation dialog component dynamically to avoid circular deps
    // For now, we'll use a simple confirm approach with MatDialog
    const config = this.buildConfig({
      size: DialogSize.SMALL,
      data,
      disableClose: true
    });

    // Use a lazy-loaded confirmation dialog
    return this.openConfirmDialog(data);
  }

  /**
   * Close all open dialogs
   */
  closeAll(): void {
    this.dialog.closeAll();
  }

  /**
   * Get count of open dialogs
   */
  get openDialogsCount(): number {
    return this.dialog.openDialogs.length;
  }

  /**
   * Build MatDialogConfig from options
   */
  private buildConfig<D>(options: DialogOptions<D>): MatDialogConfig<D> {
    const size = options.size || this.DEFAULT_SIZE;
    const width = Object.values(DialogSize).includes(size as DialogSize)
      ? size
      : size;

    const config: MatDialogConfig<D> = {
      width,
      data: options.data,
      disableClose: options.disableClose ?? false,
      autoFocus: options.autoFocus ?? true,
      panelClass: this.buildPanelClass(options.panelClass),
      maxHeight: options.maxHeight ?? '90vh'
    };

    return config;
  }

  /**
   * Build panel class array
   */
  private buildPanelClass(customClass?: string | string[]): string[] {
    const baseClass = 'app-dialog';
    
    if (!customClass) {
      return [baseClass];
    }

    if (Array.isArray(customClass)) {
      return [baseClass, ...customClass];
    }

    return [baseClass, customClass];
  }

  /**
   * Open the confirmation dialog
   * Uses the inline ConfirmationDialogInlineComponent
   */
  private openConfirmDialog(data: ConfirmDialogData): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const dialogRef = this.dialog.open(ConfirmationDialogInlineComponent, {
        width: DialogSize.SMALL,
        data,
        disableClose: true,
        panelClass: ['app-dialog', 'confirm-dialog']
      });

      dialogRef.afterClosed().subscribe(result => {
        observer.next(result === true);
        observer.complete();
      });
    });
  }
}

/**
 * Inline confirmation dialog component
 * A simple, reusable confirmation dialog
 */
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef as DialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog-inline',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || 'Anulează' }}
      </button>
      <button 
        mat-flat-button 
        [color]="data.confirmColor || 'primary'"
        (click)="onConfirm()">
        {{ data.confirmText || 'Confirmă' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
    }
    mat-dialog-content p {
      color: var(--color-dark, #1D1D1B);
      margin: 0;
    }
    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class ConfirmationDialogInlineComponent {
  constructor(
    public dialogRef: DialogRef<ConfirmationDialogInlineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
