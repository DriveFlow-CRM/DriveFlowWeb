import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DeleteConfirmationData {
  name: string;
  type: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="delete-dialog">
      <h2 class="dialog-title">Delete {{ data.type }}</h2>
      <div class="dialog-content">
        <div class="warning-icon">
          <span class="material-icons">warning</span>
        </div>
        <p>Are you sure you want to delete <strong>"{{ data.name }}"</strong>?</p>
        <p class="warning-text">This action cannot be undone. All users, progress, and data related to this {{ data.type.toLowerCase() }} will be permanently deleted.</p>
      </div>
      <div class="dialog-actions">
        <button class="cancel-button" (click)="onNoClick()">Cancel</button>
        <button class="delete-button" (click)="onYesClick()">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 20px;
      width: 450px;
      max-width: 100%;
    }
    .dialog-title {
      font-size: 20px;
      color: #1a202c;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .dialog-content {
      margin-bottom: 24px;
    }
    .warning-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .warning-icon .material-icons {
      font-size: 48px;
      color: #EF4444;
    }
    .warning-text {
      margin-top: 12px;
      color: #EF4444;
      font-weight: 500;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .cancel-button {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #4a5568;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .cancel-button:hover {
      background: #f7fafc;
    }
    .delete-button {
      padding: 8px 16px;
      border: none;
      background: #EF4444;
      color: white;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .delete-button:hover {
      background: #DC2626;
    }
  `]
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
