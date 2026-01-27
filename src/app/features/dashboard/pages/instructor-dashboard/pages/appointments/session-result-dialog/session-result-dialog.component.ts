import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SessionFormResult } from '../../../../../../../models/interfaces/session-form.model';

@Component({
  selector: 'app-session-result-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './session-result-dialog.component.html',
  styleUrls: ['./session-result-dialog.component.css']
})
export class SessionResultDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SessionResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SessionFormResult
  ) {}

  get isPassed(): boolean {
    return this.data.result === 'OK';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
