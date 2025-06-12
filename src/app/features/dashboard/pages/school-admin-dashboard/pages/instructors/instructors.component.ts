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
  teachingCategories: TeachingCategory[] = [];
  schoolId: number = 0;
  instructorsLoading: boolean = true;
  categoriesLoading: boolean = true;
  selectedInstructor: Instructor | null = null;
  instructorCategories: ApplicationUserTeachingCategory[] = [];
  instructorCategoriesLoading: boolean = false;

  // Columns for instructors table
  instructorColumns: string[] = ['name', 'email', 'phone', 'actions'];

  // Columns for teaching categories table
  categoryColumns: string[] = ['licenseType', 'sessionCost', 'sessionDuration', 'scholarshipPrice', 'minDrivingLessonsReq', 'actions'];

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
  }

  // Load instructors for the school
  loadInstructors(): void {
    this.instructorsLoading = true;
    this.instructorService.getInstructors(this.schoolId)
      .subscribe({
        next: (data) => {
          this.instructors = data;
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
          this.categoriesLoading = false;
        },
        error: (error) => {
          console.error('Error loading teaching categories:', error);
          this.categoriesLoading = false;
        }
      });
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
    // First, load the instructor's categories
    this.instructorCategoryService.getInstructorTeachingCategories(this.schoolId, instructor.userId)
      .subscribe({
        next: (categories) => {
          // Map the category IDs
          const teachingCategoryIds = categories.map(cat => cat.teachingCategoryId);

          // Open the edit dialog with the instructor data and their categories
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
    // Get the instructor's current categories to exclude them from options
    this.instructorCategoryService.getInstructorTeachingCategories(this.schoolId, instructor.userId)
      .subscribe({
        next: (categories) => {
          // Get the IDs of categories the instructor already has
          const assignedCategoryIds = categories.map(cat => cat.teachingCategoryId);

          // Filter out already assigned categories
          const availableCategories = this.teachingCategories.filter(
            cat => !assignedCategoryIds.includes(cat.teachingCategoryId)
          );

          // If no categories are available, don't open the dialog
          if (availableCategories.length === 0) {
            alert('Acest instructor este deja asignat la toate categoriile disponibile.');
            return;
          }

          // Open the dialog with available categories
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

  // Add a new instructor
  addInstructor(data: any): void {
    this.instructorService.addInstructor(this.schoolId, data)
      .subscribe({
        next: () => {
          this.loadInstructors();
        },
        error: (error) => console.error('Error adding instructor:', error)
      });
  }

  // Update an existing instructor
  updateInstructor(instructorId: string, data: any): void {
    this.instructorService.updateInstructor(this.schoolId, instructorId, data)
      .subscribe({
        next: () => {
          this.loadInstructors();
          // If this was the selected instructor, refresh their categories
          if (this.selectedInstructor && this.selectedInstructor.userId === instructorId) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error updating instructor:', error)
      });
  }

  // Delete an instructor
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
          // If this was the selected instructor, clear the selection
          if (this.selectedInstructor && this.selectedInstructor.userId === instructorId) {
            this.selectedInstructor = null;
            this.instructorCategories = [];
          }
        },
        error: (error) => console.error('Error deleting instructor:', error)
      });
  }

  // Add a new teaching category
  addTeachingCategory(data: any): void {
    this.teachingCategoryService.addTeachingCategory(this.schoolId, data)
      .subscribe({
        next: () => {
          this.loadTeachingCategories();
        },
        error: (error) => console.error('Error adding teaching category:', error)
      });
  }

  // Update an existing teaching category
  updateTeachingCategory(categoryId: number, data: any): void {
    this.teachingCategoryService.updateTeachingCategory(this.schoolId, categoryId, data)
      .subscribe({
        next: () => {
          this.loadTeachingCategories();
          // If we have a selected instructor, refresh their categories too
          if (this.selectedInstructor) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error updating teaching category:', error)
      });
  }

  // Delete a teaching category
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
          // If we have a selected instructor, refresh their categories too
          if (this.selectedInstructor) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error deleting teaching category:', error)
      });
  }

  // Assign a teaching category to an instructor
  assignCategoryToInstructor(instructorId: string, categoryId: number): void {
    const request = {
      instructorId: instructorId,
      teachingCategoryId: categoryId
    };

    this.instructorCategoryService.assignTeachingCategoryToInstructor(this.schoolId, request)
      .subscribe({
        next: () => {
          // If this is the selected instructor, refresh their categories
          if (this.selectedInstructor && this.selectedInstructor.userId === instructorId) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error assigning category to instructor:', error)
      });
  }

  // Remove a teaching category from an instructor
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
          // If we have a selected instructor, refresh their categories
          if (this.selectedInstructor) {
            this.loadInstructorCategories(this.selectedInstructor);
          }
        },
        error: (error) => console.error('Error removing category from instructor:', error)
      });
  }

  // Format currency
  formatCurrency(value: number): string {
    return `${value} RON`;
  }

  // Format duration in minutes
  formatDuration(minutes: number): string {
    return `${minutes} min`;
  }
}
