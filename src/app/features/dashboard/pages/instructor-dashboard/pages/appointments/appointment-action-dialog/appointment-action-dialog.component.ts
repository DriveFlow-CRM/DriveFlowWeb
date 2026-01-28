import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InstructorAppointment } from '../../../../../../../models/interfaces/instructor-availability.model';

export interface AppointmentActionDialogData {
  appointment: InstructorAppointment;
}

export type AppointmentActionResult = 'session-form' | 'close' | null;

@Component({
  selector: 'app-appointment-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './appointment-action-dialog.component.html',
  styleUrls: ['./appointment-action-dialog.component.css']
})
export class AppointmentActionDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AppointmentActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentActionDialogData
  ) {}

  get appointment(): InstructorAppointment {
    return this.data.appointment;
  }

  get isToday(): boolean {
    const today = new Date();
    const appointmentDate = new Date(this.appointment.date);
    return today.toDateString() === appointmentDate.toDateString();
  }

  get isPast(): boolean {
    const now = new Date();
    const appointmentDate = new Date(this.appointment.date);
    const [hours, minutes] = this.appointment.endHour.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate < now;
  }

  get canFillSessionForm(): boolean {
    // Can fill session form if the appointment is today or in the past
    return this.isToday || this.isPast;
  }

  onFillSessionForm(): void {
    this.dialogRef.close('session-form');
  }

  onClose(): void {
    this.dialogRef.close('close');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
