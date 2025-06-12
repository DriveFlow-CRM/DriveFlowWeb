import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';

import { InstructorAvailabilityService } from '../../../../../../core/services/instructor-availability.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { InstructorAppointment, InstructorAvailability } from '../../../../../../models/interfaces/instructor-availability.model';

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  appointments: InstructorAppointment[];
  availability: InstructorAvailability[];
}

interface TimeSlot {
  hour: string;
  display: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  instructorId = '';
  appointments: InstructorAppointment[] = [];
  availability: InstructorAvailability[] = [];
  isLoading = false;

  currentWeek: WeekDay[] = [];
  currentWeekStart: Date = new Date();

  timeSlots: TimeSlot[] = [
    { hour: '08:00', display: '8:00 AM' },
    { hour: '08:30', display: '8:30 AM' },
    { hour: '09:00', display: '9:00 AM' },
    { hour: '09:30', display: '9:30 AM' },
    { hour: '10:00', display: '10:00 AM' },
    { hour: '10:30', display: '10:30 AM' },
    { hour: '11:00', display: '11:00 AM' },
    { hour: '11:30', display: '11:30 AM' },
    { hour: '12:00', display: '12:00 PM' },
    { hour: '12:30', display: '12:30 PM' },
    { hour: '13:00', display: '1:00 PM' },
    { hour: '13:30', display: '1:30 PM' },
    { hour: '14:00', display: '2:00 PM' },
    { hour: '14:30', display: '2:30 PM' },
    { hour: '15:00', display: '3:00 PM' },
    { hour: '15:30', display: '3:30 PM' },
    { hour: '16:00', display: '4:00 PM' },
    { hour: '16:30', display: '4:30 PM' },
    { hour: '17:00', display: '5:00 PM' },
    { hour: '17:30', display: '5:30 PM' },
    { hour: '18:00', display: '6:00 PM' },
    { hour: '18:30', display: '6:30 PM' },
    { hour: '19:00', display: '7:00 PM' },
    { hour: '19:30', display: '7:30 PM' },
    { hour: '20:00', display: '8:00 PM' }
  ];

  constructor(
    private availabilityService: InstructorAvailabilityService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.instructorId = userData.userId;
      this.initializeCurrentWeek();
      this.loadWeekData();
    }
  }

  initializeCurrentWeek(): void {
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);
    this.currentWeekStart = startOfWeek;
    this.generateWeekDays();
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  generateWeekDays(): void {
    this.currentWeek = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);

      this.currentWeek.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: this.isSameDay(date, today),
        appointments: [],
        availability: []
      });
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  loadWeekData(): void {
    this.isLoading = true;

    const endOfWeek = new Date(this.currentWeekStart);
    endOfWeek.setDate(this.currentWeekStart.getDate() + 6);

    const startDate = this.formatDate(this.currentWeekStart);
    const endDate = this.formatDate(endOfWeek);

    // Load both appointments and availability data
    forkJoin({
      appointments: this.availabilityService.getInstructorAppointments(this.instructorId, startDate, endDate),
      availability: this.availabilityService.getInstructorAvailability(this.instructorId)
    }).subscribe({
      next: (data) => {
        this.appointments = data.appointments;
        this.availability = data.availability;
        this.distributeDataToWeek();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading week data:', error);
        this.snackBar.open('Failed to load schedule data', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  distributeDataToWeek(): void {
    // Clear existing data
    this.currentWeek.forEach(day => {
      day.appointments = [];
      day.availability = [];
    });

    // Distribute appointments to their respective days
    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const weekDay = this.currentWeek.find(day => this.isSameDay(day.date, appointmentDate));
      if (weekDay) {
        weekDay.appointments.push(appointment);
      }
    });

    // Distribute availability to their respective days
    this.availability.forEach(avail => {
      const availDate = new Date(avail.date);
      const weekDay = this.currentWeek.find(day => this.isSameDay(day.date, availDate));
      if (weekDay) {
        weekDay.availability.push(avail);
      }
    });

    // Sort appointments and availability by time for each day
    this.currentWeek.forEach(day => {
      day.appointments.sort((a, b) => a.startHour.localeCompare(b.startHour));
      day.availability.sort((a, b) => a.startHour.localeCompare(b.startHour));
    });
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateWeekDays();
    this.loadWeekData();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateWeekDays();
    this.loadWeekData();
  }

  goToCurrentWeek(): void {
    this.initializeCurrentWeek();
    this.loadWeekData();
  }

  getWeekRange(): string {
    const endOfWeek = new Date(this.currentWeekStart);
    endOfWeek.setDate(this.currentWeekStart.getDate() + 6);

    const startMonth = this.currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${this.currentWeekStart.getDate()}-${endOfWeek.getDate()}, ${this.currentWeekStart.getFullYear()}`;
    } else {
      return `${startMonth} ${this.currentWeekStart.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${this.currentWeekStart.getFullYear()}`;
    }
  }

  getAppointmentTypeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'theory':
        return 'appointment-theory';
      case 'practical':
        return 'appointment-practical';
      case 'exam':
        return 'appointment-exam';
      default:
        return 'appointment-default';
    }
  }

  getAppointmentTypeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'theory':
        return '#34A853';
      case 'practical':
        return '#4285F4';
      case 'exam':
        return '#EA4335';
      default:
        return '#44D9E6';
    }
  }

  onAppointmentClick(appointment: InstructorAppointment): void {
    const message = `${appointment.firstName} ${appointment.lastName} - ${appointment.type} (${appointment.startHour} - ${appointment.endHour})`;
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['appointment-info-snackbar']
    });
  }

  onAvailabilityClick(availability: InstructorAvailability): void {
    const message = `Available: ${availability.startHour} - ${availability.endHour}`;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['availability-info-snackbar']
    });
  }

  hasAppointmentAtTime(day: WeekDay, timeSlot: string): boolean {
    return day.appointments.some(apt => apt.startHour === timeSlot);
  }

  getAppointmentAtTime(day: WeekDay, timeSlot: string): InstructorAppointment | null {
    return day.appointments.find(apt => apt.startHour === timeSlot) || null;
  }

  hasAvailabilityAtTime(day: WeekDay, timeSlot: string): boolean {
    return day.availability.some(avail => this.isTimeInRange(timeSlot, avail.startHour, avail.endHour));
  }

  getAvailabilityAtTime(day: WeekDay, timeSlot: string): InstructorAvailability | null {
    return day.availability.find(avail => this.isTimeInRange(timeSlot, avail.startHour, avail.endHour)) || null;
  }

  private isTimeInRange(timeSlot: string, startTime: string, endTime: string): boolean {
    const slot = this.parseTimeToMinutes(timeSlot);
    const start = this.parseTimeToMinutes(startTime);
    const end = this.parseTimeToMinutes(endTime);
    return slot >= start && slot < end;
  }

  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    return hours * 60 + minutes;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

