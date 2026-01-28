import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../../../../core/services/auth.service';
import { FileService } from '../../../../../../core/services/file.service';
import { InstructorService } from '../../../../../../core/services/instructor.service';
import { VehicleService } from '../../../../../../core/services/vehicle.service';
import { StudentService } from '../../../../../../core/services/student.service';
import { FileWithStudent } from '../../../../../../models/interfaces/file.model';
import { Vehicle } from '../../../../../../models/interfaces/vehicle.model';
import { Instructor } from '../../../../../../models/interfaces/instructor.model';

interface DashboardStats {
  totalStudents: number;
  activeFiles: number;
  totalInstructors: number;
  totalVehicles: number;
}

// Updated to support both vehicle and student file documents
interface DocumentAlert {
  id: string; // Unique identifier
  sourceType: 'vehicle' | 'student';
  // For vehicles
  vehicleId?: number;
  licensePlate?: string;
  brand?: string;
  model?: string;
  // For students
  studentName?: string;
  fileId?: number;
  category?: string;
  // Common
  documentType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  isExpired: boolean;
}

interface PaymentAlert {
  studentName: string;
  fileId: number;
  category: string;
  missingBasePayment: boolean;
  sessionsPaid: number;
  sessionsRequired: number;
}

interface RecentFile {
  fileId: number;
  studentName: string;
  category: string;
  status: string;
  startDate: string;
  instructorName: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  userName = '';
  schoolId = 0;
  isLoading = true;

  stats: DashboardStats = {
    totalStudents: 0,
    activeFiles: 0,
    totalInstructors: 0,
    totalVehicles: 0
  };

  documentAlerts: DocumentAlert[] = [];
  paymentAlerts: PaymentAlert[] = [];
  recentFiles: RecentFile[] = [];

  private filesData: FileWithStudent[] = [];
  private vehiclesData: Vehicle[] = [];
  private instructorsData: Instructor[] = [];

  constructor(
    private authService: AuthService,
    private fileService: FileService,
    private instructorService: InstructorService,
    private vehicleService: VehicleService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = `${userData.firstName} ${userData.lastName}`;
      this.schoolId = userData.schoolId || 0;
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      files: this.fileService.getAllFiles(this.schoolId),
      instructors: this.instructorService.getInstructors(this.schoolId),
      vehicles: this.vehicleService.getVehicles(this.schoolId)
    }).subscribe({
      next: (data) => {
        this.filesData = data.files || [];
        this.instructorsData = data.instructors || [];
        this.vehiclesData = data.vehicles || [];

        this.calculateStats();
        this.generateDocumentAlerts();
        this.generatePaymentAlerts();
        this.generateRecentFiles();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  private calculateStats(): void {
    // Count unique students from files
    const uniqueStudents = new Set(this.filesData.map(f => f.studentData?.studentId));
    this.stats.totalStudents = uniqueStudents.size;

    // Count active files (status APPROVED)
    let activeCount = 0;
    this.filesData.forEach(fileWithStudent => {
      if (fileWithStudent.files) {
        activeCount += fileWithStudent.files.filter(f => f.status === 'APPROVED').length;
      }
    });
    this.stats.activeFiles = activeCount;

    // Count instructors and vehicles
    this.stats.totalInstructors = this.instructorsData.length;
    this.stats.totalVehicles = this.vehiclesData.length;
  }

  private generateDocumentAlerts(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    this.documentAlerts = [];

    // Check vehicle documents (ITP, Insurance, RCA)
    this.vehiclesData.forEach(vehicle => {
      if (vehicle.itpExpiryDate) {
        const alert = this.checkVehicleDocumentExpiry(vehicle, 'ITP', vehicle.itpExpiryDate, today, thirtyDaysFromNow);
        if (alert) this.documentAlerts.push(alert);
      }

      if (vehicle.insuranceExpiryDate) {
        const alert = this.checkVehicleDocumentExpiry(vehicle, 'Asigurare', vehicle.insuranceExpiryDate, today, thirtyDaysFromNow);
        if (alert) this.documentAlerts.push(alert);
      }

      if (vehicle.rcaExpiryDate) {
        const alert = this.checkVehicleDocumentExpiry(vehicle, 'RCA', vehicle.rcaExpiryDate, today, thirtyDaysFromNow);
        if (alert) this.documentAlerts.push(alert);
      }
    });

    // Check student file documents (Criminal Record, Medical Record)
    this.filesData.forEach(fileWithStudent => {
      const student = fileWithStudent.studentData;
      if (!student || !fileWithStudent.files) return;

      fileWithStudent.files.forEach(file => {
        // Only check active files
        if (file.status !== 'APPROVED') return;

        const studentName = `${student.firstName} ${student.lastName}`;
        const category = file.teachingCategory?.licenseType || 'N/A';

        // Check Criminal Record (Cazier)
        if (file.criminalRecordExpiryDate) {
          const alert = this.checkStudentDocumentExpiry(
            file.fileId,
            studentName,
            category,
            'Cazier',
            file.criminalRecordExpiryDate,
            today,
            thirtyDaysFromNow
          );
          if (alert) this.documentAlerts.push(alert);
        }

        // Check Medical Record (Fișă medicală)
        if (file.medicalRecordExpiryDate) {
          const alert = this.checkStudentDocumentExpiry(
            file.fileId,
            studentName,
            category,
            'Fișă medicală',
            file.medicalRecordExpiryDate,
            today,
            thirtyDaysFromNow
          );
          if (alert) this.documentAlerts.push(alert);
        }
      });
    });

    // Sort by days until expiry (expired first, then soonest)
    this.documentAlerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  private checkVehicleDocumentExpiry(
    vehicle: Vehicle,
    docType: string,
    expiryDateStr: string,
    today: Date,
    thirtyDaysFromNow: Date
  ): DocumentAlert | null {
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate <= thirtyDaysFromNow) {
      const diffTime = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: `vehicle-${vehicle.vehicleId}-${docType}`,
        sourceType: 'vehicle',
        vehicleId: vehicle.vehicleId,
        licensePlate: vehicle.licensePlateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        documentType: docType,
        expiryDate: expiryDateStr,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0
      };
    }
    return null;
  }

  private checkStudentDocumentExpiry(
    fileId: number,
    studentName: string,
    category: string,
    docType: string,
    expiryDateStr: string,
    today: Date,
    thirtyDaysFromNow: Date
  ): DocumentAlert | null {
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate <= thirtyDaysFromNow) {
      const diffTime = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: `student-${fileId}-${docType}`,
        sourceType: 'student',
        studentName,
        fileId,
        category,
        documentType: docType,
        expiryDate: expiryDateStr,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0
      };
    }
    return null;
  }

  private generatePaymentAlerts(): void {
    this.paymentAlerts = [];

    this.filesData.forEach(fileWithStudent => {
      const student = fileWithStudent.studentData;
      if (!student || !fileWithStudent.files) return;

      fileWithStudent.files.forEach(file => {
        if (file.status !== 'APPROVED') return;

        const payment = file.payment;
        const category = file.teachingCategory;

        if (!payment || !category) return;

        // Check if base payment is missing or sessions are underpaid
        const missingBase = !payment.scholarshipBasePayment;
        const sessionsBehind = payment.sessionsPayed < category.minDrivingLessonsReq;

        if (missingBase || sessionsBehind) {
          this.paymentAlerts.push({
            studentName: `${student.firstName} ${student.lastName}`,
            fileId: file.fileId,
            category: category.licenseType,
            missingBasePayment: missingBase,
            sessionsPaid: payment.sessionsPayed,
            sessionsRequired: category.minDrivingLessonsReq
          });
        }
      });
    });

    // Limit to 5 alerts
    this.paymentAlerts = this.paymentAlerts.slice(0, 5);
  }

  private generateRecentFiles(): void {
    this.recentFiles = [];

    // Flatten all files with student info
    const allFiles: RecentFile[] = [];

    this.filesData.forEach(fileWithStudent => {
      const student = fileWithStudent.studentData;
      if (!student || !fileWithStudent.files) return;

      fileWithStudent.files.forEach(file => {
        const instructor = file.instructor;
        allFiles.push({
          fileId: file.fileId,
          studentName: `${student.firstName} ${student.lastName}`,
          category: file.teachingCategory?.licenseType || 'N/A',
          status: file.status,
          startDate: file.scholarshipStartDate,
          instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Nealocat'
        });
      });
    });

    // Sort by start date (newest first) and take top 5
    allFiles.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });

    this.recentFiles = allFiles.slice(0, 5);
  }

  // Navigation methods
  navigateToFiles(): void {
    this.router.navigate(['/dashboard/school-admin/files']);
  }

  navigateToInstructors(): void {
    this.router.navigate(['/dashboard/school-admin/instructors']);
  }

  navigateToCars(): void {
    this.router.navigate(['/dashboard/school-admin/cars']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/dashboard/school-admin/instructors']);
  }

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Aprobat';
      case 'ARCHIVED': return 'Arhivat';
      case 'EXPIRED': return 'Expirat';
      case 'FINALISED': return 'Finalizat';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'FINALISED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAlertColor(daysUntilExpiry: number): string {
    if (daysUntilExpiry < 0) return 'border-red-500 bg-red-50';
    if (daysUntilExpiry <= 7) return 'border-red-400 bg-red-50';
    if (daysUntilExpiry <= 14) return 'border-amber-500 bg-amber-50';
    return 'border-amber-400 bg-amber-50';
  }

  getAlertTextColor(daysUntilExpiry: number): string {
    if (daysUntilExpiry < 0) return 'text-red-700';
    if (daysUntilExpiry <= 7) return 'text-red-600';
    return 'text-amber-600';
  }

  getAlertIcon(alert: DocumentAlert): string {
    if (alert.sourceType === 'vehicle') {
      return 'directions_car';
    }
    return 'person';
  }
}
