import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { InstructorAvailabilityService } from '../../../../../../core/services/instructor-availability.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { InstructorAssignedFile } from '../../../../../../models/interfaces/instructor-availability.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assigned-files',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './assigned-files.component.html',
  styleUrls: ['./assigned-files.component.css']
})
export class AssignedFilesComponent implements OnInit {
  assignedFiles: InstructorAssignedFile[] = [];
  filteredFiles: InstructorAssignedFile[] = [];
  displayedColumns: string[] = ['name', 'contact', 'details', 'status', 'actions'];
  isLoading = false;
  instructorId = '';
  searchTerm = '';

  // Pagination properties
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private availabilityService: InstructorAvailabilityService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.instructorId = userData.userId;
      this.loadAssignedFiles();
    }
  }

  loadAssignedFiles(): void {
    this.isLoading = true;
    this.availabilityService.getInstructorAssignedFiles(this.instructorId)
      .subscribe({
        next: (data) => {
          this.assignedFiles = data;
          this.filterFiles();
          this.totalItems = this.filteredFiles.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading assigned files:', error);
          this.snackBar.open('Failed to load assigned files', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  filterFiles(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFiles = [...this.assignedFiles];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredFiles = this.assignedFiles.filter(file =>
        file.firstName.toLowerCase().includes(searchTermLower) ||
        file.lastName.toLowerCase().includes(searchTermLower) ||
        file.email.toLowerCase().includes(searchTermLower) ||
        file.type.toLowerCase().includes(searchTermLower)
      );
    }
    this.totalItems = this.filteredFiles.length;
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  viewFileDetails(fileId: number): void {
    // Navigate to file details page with proper route
    if (fileId) {
      this.router.navigate(['/dashboard/instructor/file-details', fileId]);
    } else {
      this.snackBar.open('File details not available', 'Close', { duration: 3000 });
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'archived':
        return 'gray';
      case 'pending':
        return 'orange';
      default:
        return '';
    }
  }

  // For table pagination and sorting
  getCurrentPageItems(): InstructorAssignedFile[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredFiles.slice(startIndex, startIndex + this.pageSize);
  }

  onSort(sortEvent: Sort): void {
    const data = [...this.filteredFiles];
    if (!sortEvent.active || sortEvent.direction === '') {
      this.filteredFiles = data;
      return;
    }

    this.filteredFiles = data.sort((a, b) => {
      const isAsc = sortEvent.direction === 'asc';
      switch (sortEvent.active) {
        case 'name':
          return this.compare(`${a.firstName} ${a.lastName}`, `${b.firstName} ${b.lastName}`, isAsc);
        case 'email':
          return this.compare(a.email, b.email, isAsc);
        case 'status':
          return this.compare(a.status, b.status, isAsc);
        case 'type':
          return this.compare(a.type, b.type, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilter(): void {
    this.filterFiles();
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.filterFiles();
  }
}
