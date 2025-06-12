import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

import { FileService } from '../../../../../../core/services/file.service';
import { StudentService } from '../../../../../../core/services/student.service';
import { InstructorService } from '../../../../../../core/services/instructor.service';
import { VehicleService } from '../../../../../../core/services/vehicle.service';
import { TeachingCategoryService } from '../../../../../../core/services/teaching-category.service';
import { AuthService } from '../../../../../../core/services/auth.service';

import { DeleteConfirmationDialogComponent } from '../../../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FileFormDialogComponent } from './file-form-dialog/file-form-dialog.component';
import { StudentFormDialogComponent } from './student-form-dialog/student-form-dialog.component';
import { PaymentFormDialogComponent } from './payment-form-dialog/payment-form-dialog.component';

import { FileWithStudent, StudentFile, StudentData } from '../../../../../../models/interfaces/file.model';
import { Student } from '../../../../../../models/interfaces/student.model';
import { Instructor } from '../../../../../../models/interfaces/instructor.model';
import { Vehicle } from '../../../../../../models/interfaces/vehicle.model';
import { TeachingCategory } from '../../../../../../models/interfaces/teaching-category.model';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {
  files: FileWithStudent[] = [];
  students: Student[] = [];
  instructors: Instructor[] = [];
  vehicles: Vehicle[] = [];
  teachingCategories: TeachingCategory[] = [];

  schoolId: number = 0;
  filesLoading: boolean = true;
  studentsLoading: boolean = true;

  searchTerm: string = '';
  filteredFiles: FileWithStudent[] = [];
  expandedStudentId: string | null = null;

  fileStatusOptions: string[] = ['APPROVED', 'ARCHIVED', 'EXPIRED', 'FINALISED'];

  constructor(
    private fileService: FileService,
    private studentService: StudentService,
    private instructorService: InstructorService,
    private vehicleService: VehicleService,
    private teachingCategoryService: TeachingCategoryService,
    private authService: AuthService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData?.schoolId) {
      this.schoolId = userData.schoolId;
      this.loadFiles();
      this.loadStudents();
      this.loadInstructors();
      this.loadVehicles();
      this.loadTeachingCategories();
    }
  }

  // Load all files for the school
  loadFiles(): void {
    this.filesLoading = true;
    this.fileService.getAllFiles(this.schoolId)
      .subscribe({
        next: (data) => {
          this.files = data;
          this.filteredFiles = [...this.files];
          this.filesLoading = false;
        },
        error: (error) => {
          console.error('Error loading files:', error);
          this.filesLoading = false;
        }
      });
  }

  // Load all students for the school
  loadStudents(): void {
    this.studentsLoading = true;
    this.studentService.getStudents(this.schoolId)
      .subscribe({
        next: (data) => {
          this.students = data;
          this.studentsLoading = false;
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.studentsLoading = false;
        }
      });
  }

  // Load all instructors for the school
  loadInstructors(): void {
    this.instructorService.getInstructors(this.schoolId)
      .subscribe({
        next: (data) => {
          this.instructors = data;
        },
        error: (error) => {
          console.error('Error loading instructors:', error);
        }
      });
  }

  // Load all vehicles for the school
  loadVehicles(): void {
    this.vehicleService.getVehicles(this.schoolId)
      .subscribe({
        next: (data) => {
          this.vehicles = data;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
        }
      });
  }

  // Load all teaching categories for the school
  loadTeachingCategories(): void {
    this.teachingCategoryService.getTeachingCategories(this.schoolId)
      .subscribe({
        next: (data) => {
          this.teachingCategories = data;
        },
        error: (error) => {
          console.error('Error loading teaching categories:', error);
        }
      });
  }

  // Search and filter files
  searchFiles(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFiles = [...this.files];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredFiles = this.files.filter(fileWithStudent => {
      const student = fileWithStudent.studentData;
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email.toLowerCase();
      const phone = student.phoneNumber?.toLowerCase() || '';
      const cnp = student.cnp?.toLowerCase() || '';

      return fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        cnp.includes(term);
    });
  }

  // Toggle student card expansion
  toggleExpand(studentId: string): void {
    if (this.expandedStudentId === studentId) {
      this.expandedStudentId = null;
    } else {
      this.expandedStudentId = studentId;
    }
  }

  // Open dialog to add a new student with file
  openAddStudentDialog(): void {
    const dialogRef = this.dialog.open(StudentFormDialogComponent, {
      width: '800px',
      data: {
        isEditing: false,
        teachingCategories: this.teachingCategories,
        vehicles: this.vehicles,
        instructors: this.instructors
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addStudent(result);
      }
    });
  }

  // Open dialog to edit an existing student
  openEditStudentDialog(student: StudentData): void {
    const dialogRef = this.dialog.open(StudentFormDialogComponent, {
      width: '600px',
      data: {
        isEditing: true,
        student: student
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateStudent(student.studentId, result);
      }
    });
  }

  // Open dialog to add a new file to a student
  openAddFileDialog(student: StudentData): void {
    const dialogRef = this.dialog.open(FileFormDialogComponent, {
      width: '800px',
      data: {
        isEditing: false,
        student: student,
        teachingCategories: this.teachingCategories,
        vehicles: this.vehicles,
        instructors: this.instructors
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addFile(student.studentId, result);
      }
    });
  }

  // Open dialog to edit an existing file
  openEditFileDialog(file: StudentFile): void {
    const dialogRef = this.dialog.open(FileFormDialogComponent, {
      width: '800px',
      data: {
        isEditing: true,
        file: file,
        teachingCategories: this.teachingCategories,
        vehicles: this.vehicles,
        instructors: this.instructors
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateFile(file.fileId, result);
      }
    });
  }

  // Open dialog to edit payment for a file
  openEditPaymentDialog(file: StudentFile): void {
    const dialogRef = this.dialog.open(PaymentFormDialogComponent, {
      width: '500px',
      data: {
        payment: file.payment,
        sessionCost: file.teachingCategory.sessionCost,
        scholarshipPrice: file.teachingCategory.scholarshipPrice,
        minDrivingLessons: file.teachingCategory.minDrivingLessonsReq
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePayment(file.payment.paymentId, result);
      }
    });
  }

  // Confirm delete for a file
  confirmDeleteFile(file: StudentFile, studentName: string): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        name: `Dosar pentru ${studentName}`,
        type: 'dosar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteFile(file.fileId);
      }
    });
  }

  // Confirm delete for a student
  confirmDeleteStudent(student: StudentData): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        name: `${student.firstName} ${student.lastName}`,
        type: 'student'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteStudent(student.studentId);
      }
    });
  }

  // Add a new student with file
  addStudent(data: any): void {
    this.studentService.createStudent(this.schoolId, data)
      .subscribe({
        next: () => {
          this.loadFiles();
          this.loadStudents();
        },
        error: (error) => console.error('Error adding student:', error)
      });
  }

  // Update an existing student
  updateStudent(studentId: string, data: any): void {
    this.studentService.updateStudent(this.schoolId, studentId, data)
      .subscribe({
        next: () => {
          this.loadFiles();
          this.loadStudents();
        },
        error: (error) => console.error('Error updating student:', error)
      });
  }

  // Delete a student
  deleteStudent(studentId: string): void {
    this.studentService.deleteStudent(this.schoolId, studentId)
      .subscribe({
        next: () => {
          this.loadFiles();
          this.loadStudents();
        },
        error: (error) => console.error('Error deleting student:', error)
      });
  }

  // Add a new file to a student
  addFile(studentId: string, data: any): void {
    this.fileService.createFile(studentId, data)
      .subscribe({
        next: () => {
          this.loadFiles();
        },
        error: (error) => console.error('Error adding file:', error)
      });
  }

  // Update an existing file
  updateFile(fileId: number, data: any): void {
    this.fileService.editFile(fileId, data)
      .subscribe({
        next: () => {
          this.loadFiles();
        },
        error: (error) => console.error('Error updating file:', error)
      });
  }

  // Update payment for a file
  updatePayment(paymentId: number, data: any): void {
    this.fileService.editPayment(paymentId, data)
      .subscribe({
        next: () => {
          this.loadFiles();
        },
        error: (error) => console.error('Error updating payment:', error)
      });
  }

  // Delete a file
  deleteFile(fileId: number): void {
    this.fileService.deleteFile(fileId)
      .subscribe({
        next: () => {
          this.loadFiles();
        },
        error: (error) => console.error('Error deleting file:', error)
      });
  }

  // Format dates for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  }

  // Get status badge color
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-green-200 text-green-800';
      case 'ARCHIVED': return 'bg-gray-200 text-gray-800';
      case 'EXPIRED': return 'bg-red-200 text-red-800';
      case 'FINALISED': return 'bg-purple-200 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  // Get formatted status text
  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED': return 'Aprobat';
      case 'ARCHIVED': return 'Arhivat';
      case 'EXPIRED': return 'Expirat';
      case 'FINALISED': return 'Finalizat';
      default: return status;
    }
  }

  // Format currency
  formatCurrency(value: number): string {
    return `${value} RON`;
  }
}
