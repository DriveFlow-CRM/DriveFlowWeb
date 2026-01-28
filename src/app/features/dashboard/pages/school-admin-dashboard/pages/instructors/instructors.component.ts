import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { InstructorService } from '../../../../../../core/services/instructor.service';
import { TeachingCategoryService } from '../../../../../../core/services/teaching-category.service';
import { InstructorTeachingCategoryService } from '../../../../../../core/services/instructor-teaching-category.service';
import { LicenseService } from '../../../../../../core/services/license.service';
import { AuthService } from '../../../../../../core/services/auth.service';

import { DeleteConfirmationDialogComponent } from '../../../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { InstructorFormDialogComponent } from './instructor-form-dialog/instructor-form-dialog.component';
import { TeachingCategoryFormDialogComponent } from './teaching-category-form-dialog/teaching-category-form-dialog.component';
import { AssignCategoryDialogComponent } from './assign-category-dialog/assign-category-dialog.component';

import { Instructor } from '../../../../../../models/interfaces/instructor.model';
import { TeachingCategory, ApplicationUserTeachingCategory } from '../../../../../../models/interfaces/teaching-category.model';

interface SummaryStats {
  totalInstructors: number;
  totalCategories: number;
  avgSessionCost: number;
}

@Component({
  selector: 'app-instructors',
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
    MatTooltipModule
  ],
  templateUrl: './instructors.component.html',
  styleUrls: ['./instructors.component.css']
})
export class InstructorsComponent implements OnInit {
  instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  teachingCategories: TeachingCategory[] = [];
  filteredCategories: TeachingCategory[] = [];
  schoolId: number = 0;
  instructorsLoading: boolean = true;
  categoriesLoading: boolean = true;
  selectedInstructor: Instructor | null = null;
  instructorCategories: ApplicationUserTeachingCategory[] = [];
  instructorCategoriesLoading: boolean = false;

  // Search
  searchTermInstructors: string = '';
  searchTermCategories: string = '';
  private searchSubjectInstructors = new Subject<string>();
  private searchSubjectCategories = new Subject<string>();

  // Summary stats
  summaryStats: SummaryStats = {
    totalInstructors: 0,
    totalCategories: 0,
    avgSessionCost: 0
  };

  // Active tab index
  activeTabIndex: number = 0;

  constructor(
    private instructorService: InstructorService,
    private teachingCategoryService: TeachingCategoryService,
    private instructorCategoryService: InstructorTeachingCategoryService,
    private licenseService: LicenseService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData?.schoolId) {
      this.schoolId = userData.schoolId;
      this.loadInstructors();
      this.loadTeachingCategories();
    }

    // Setup search debounce for instructors
    this.searchSubjectInstructors.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTermInstructors = term;
      this.filterInstructors();
    });

    // Setup search debounce for categories
    this.searchSubjectCategories.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTermCategories = term;
      this.filterCategories();
    });
  }

  // Load instructors for the school
  loadInstructors(): void {
    this.instructorsLoading = true;
    this.instructorService.getInstructors(this.schoolId)
      .subscribe({
        next: (data) => {
          this.instructors = data;
          this.filteredInstructors = [...data];
          this.calculateSummaryStats();
          this.instructorsLoading = false;
        },
        error: (error) => {
          console.error('Error loading instructors:', error);
          this.instructorsLoading = false;
        }
      });
  }

  // Load teaching categories for the school
  loadTeachingCategories(): void {
    this.categoriesLoading = true;
    this.teachingCategoryService.getTeachingCategories(this.schoolId)
      .subscribe({
        next: (data) => {
          this.teachingCategories = data;
          this.filteredCategories = [...data];
          this.calculateSummaryStats();
          this.categoriesLoading = false;
        },
        error: (error) => {
          console.error('Error loading teaching categories:', error);
          this.categoriesLoading = false;
        }
      });
  }

  calculateSummaryStats(): void {
    this.summaryStats.totalInstructors = this.instructors.length;
    this.summaryStats.totalCategories = this.teachingCategories.length;

    if (this.teachingCategories.length > 0) {
      const totalCost = this.teachingCategories.reduce((sum, cat) => sum + cat.sessionCost, 0);
      this.summaryStats.avgSessionCost = Math.round(totalCost / this.teachingCategories.length);
    }
  }

  // Search handlers
  onSearchInputInstructors(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubjectInstructors.next(target.value);
  }

  onSearchInputCategories(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubjectCategories.next(target.value);
  }

  filterInstructors(): void {
    if (!this.searchTermInstructors.trim()) {
      this.filteredInstructors = [...this.instructors];
      return;
    }

    const term = this.searchTermInstructors.toLowerCase().trim();
    this.filteredInstructors = this.instructors.filter(instructor => {
      const name = `${instructor.firstName} ${instructor.lastName}`.toLowerCase();
      const email = instructor.email?.toLowerCase() || '';
      const phone = instructor.phone?.toLowerCase() || '';

      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }

  filterCategories(): void {
    if (!this.searchTermCategories.trim()) {
      this.filteredCategories = [...this.teachingCategories];
      return;
    }

    const term = this.searchTermCategories.toLowerCase().trim();
    this.filteredCategories = this.teachingCategories.filter(category => {
      const type = category.licenseType?.toLowerCase() || '';
      return type.includes(term);
    });
  }

  clearInstructorSearch(): void {
    this.searchTermInstructors = '';
    this.filterInstructors();
  }

  clearCategorySearch(): void {
    this.searchTermCategories = '';
    this.filterCategories();
  }

  // Get initials for avatar
  getInitials(instructor: Instructor): string {
    const first = instructor.firstName?.charAt(0)?.toUpperCase() || '';
    const last = instructor.lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  }

  // Load categories for a specific instructor
  loadInstructorCategories(instructor: Instructor): void {
    this.selectedInstructor = instructor;
    this.instructorCategoriesLoading = true;
    this.instructorCategoryService.getInstructorTeachingCategories(this.schoolId, instructor.userId)
      .subscribe({
        next: (data) => {
          this.instructorCategories = data;
          this.instructorCategoriesLoading = false;
        },
        error: (error) => {
          console.error('Error loading instructor categories:', error);
          this.instructorCategoriesLoading = false;
        }
      });
  }

  closeInstructorDetail(): void {
    this.selectedInstructor = null;
    this.instructorCategories = [];
  }

  // Open dialog to add a new instructor
  openAddInstructorDialog(): void {
    const dialogRef = this.dialog.open(InstructorFormDialogComponent, {
      width: '600px',
      data: {
        isEditing: false,
        teachingCategories: this.teachingCategories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addInstructor(result);
      }
    });
  }

  // Open dialog to edit an existing instructor
  openEditInstructorDialog(instructor: Instructor): void {
    this.instructorCategoryService.getInstructorTeachingCategories(this.schoolId, instructor.userId)
      .subscribe({
        next: (categories) => {
          const teachingCategoryIds = categories.map(cat => cat.teachingCategoryId);

          const dialogRef = this.dialog.open(InstructorFormDialogComponent, {
            width: '600px',
            data: {
              isEditing: true,
              instructor: {
                ...instructor,
                teachingCategoryIds: teachingCategoryIds
              },
              teachingCategories: this.teachingCategories
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.updateInstructor(instructor.userId, result);
            }
          });
        },
        error: (error) => {
          console.error('Error loading instructor categories for edit:', error);
        }
      });
  }

  // Open dialog to add a new teaching category
  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(TeachingCategoryFormDialogComponent, {
      width: '500px',
      data: {
        isEditing: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addTeachingCategory(result);
      }
    });
  }

  // Open dialog to edit an existing teaching category
  openEditCategoryDialog(category: TeachingCategory): void {
    const dialogRef = this.dialog.open(TeachingCategoryFormDialogComponent, {
      width: '500px',
      data: {
        isEditing: true,
        category: category
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTeachingCategory(category.teachingCategoryId, result);
      }
    });
  }

  // Open dialog to assign a teaching category to an instructor
  openAssignCategoryDialog(instructor: Instructor): void {
    this.instructorCategoryService.getInstructorTeachingCategories(this.schoolId, instructor.userId)
      .subscribe({
        next: (categories) => {
          const assignedCategoryIds = categories.map(cat => cat.teachingCategoryId);
          const availableCategories = this.teachingCategories.filter(
            cat => !assignedCategoryIds.includes(cat.teachingCategoryId)
          );

          if (availableCategories.length === 0) {
            alert('Acest instructor este deja asignat la toate categoriile disponibile.');
            return;
          }

          const dialogRef = this.dialog.open(AssignCategoryDialogComponent, {
            width: '400px',
            data: {
              instructor: instructor,
              availableCategories: availableCategories
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.assignCategoryToInstructor(instructor.userId, result.teachingCategoryId);
            }
          });
        },
        error: (error) => {
          console.error('Error loading instructor categories for assignment:', error);
        }
      });
  }

  // CRUD operations
  addInstructor(data: any): void {
    this.instructorService.addInstructor(this.schoolId, data)
      .subscribe({
        next: () => this.loadInstructors(),
        error: (error) => console.error('Error adding instructor:', error)
      });
  }

  updateInstructor(instructorId: string, data: any): void {
    this.instructorService.updateInstructor(this.schoolId, instructorId, data)
      .subscribe({
        next: () => {
          this.loadInstructors();
          if (this.selectedInstructor && this.selectedInstructor.userId === instructorId) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error updating instructor:', error)
      });
  }

  confirmDeleteInstructor(instructor: Instructor): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        name: `${instructor.firstName} ${instructor.lastName}`,
        type: 'Instructor'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteInstructor(instructor.userId);
      }
    });
  }

  deleteInstructor(instructorId: string): void {
    this.instructorService.deleteInstructor(this.schoolId, instructorId)
      .subscribe({
        next: () => {
          this.loadInstructors();
          if (this.selectedInstructor && this.selectedInstructor.userId === instructorId) {
            this.selectedInstructor = null;
            this.instructorCategories = [];
          }
        },
        error: (error) => console.error('Error deleting instructor:', error)
      });
  }

  addTeachingCategory(data: any): void {
    this.teachingCategoryService.addTeachingCategory(this.schoolId, data)
      .subscribe({
        next: () => this.loadTeachingCategories(),
        error: (error) => console.error('Error adding teaching category:', error)
      });
  }

  updateTeachingCategory(categoryId: number, data: any): void {
    this.teachingCategoryService.updateTeachingCategory(this.schoolId, categoryId, data)
      .subscribe({
        next: () => {
          this.loadTeachingCategories();
          if (this.selectedInstructor) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error updating teaching category:', error)
      });
  }

  confirmDeleteCategory(category: TeachingCategory): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        name: `Categoria ${category.licenseType}`,
        type: 'Categorie de predare'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTeachingCategory(category.teachingCategoryId);
      }
    });
  }

  deleteTeachingCategory(categoryId: number): void {
    this.teachingCategoryService.deleteTeachingCategory(this.schoolId, categoryId)
      .subscribe({
        next: () => {
          this.loadTeachingCategories();
          if (this.selectedInstructor) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error deleting teaching category:', error)
      });
  }

  assignCategoryToInstructor(instructorId: string, categoryId: number): void {
    const request = {
      instructorId: instructorId,
      teachingCategoryId: categoryId
    };

    this.instructorCategoryService.assignTeachingCategoryToInstructor(this.schoolId, request)
      .subscribe({
        next: () => {
          if (this.selectedInstructor && this.selectedInstructor.userId === instructorId) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error assigning category to instructor:', error)
      });
  }

  confirmRemoveCategory(category: ApplicationUserTeachingCategory): void {
    if (!this.selectedInstructor) return;

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        name: `Categoria ${category.licenseType} de la ${this.selectedInstructor.firstName} ${this.selectedInstructor.lastName}`,
        type: 'Asignare categorie'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeCategoryFromInstructor(category.applicationUserTeachingCategoryId);
      }
    });
  }

  removeCategoryFromInstructor(applicationUserTeachingCategoryId: number): void {
    this.instructorCategoryService.removeTeachingCategoryFromInstructor(this.schoolId, applicationUserTeachingCategoryId)
      .subscribe({
        next: () => {
          if (this.selectedInstructor) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error removing category from instructor:', error)
      });
  }

  // Formatting helpers
  formatCurrency(value: number): string {
    return `${value} RON`;
  }

  formatDuration(minutes: number): string {
    return `${minutes} min`;
  }
}
