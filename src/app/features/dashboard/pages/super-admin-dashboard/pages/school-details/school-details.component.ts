import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { AutoSchoolService } from '../../../../../../core/services/auto-school.service';
import { AutoSchool } from '../../../../../../models/interfaces/auto-school.model';
import { RequestService } from '../../../../../../core/services/request.service';
import { SchoolRequest } from '../../../../../../models/interfaces/request.model';
import { SchoolUserService, SchoolUser } from '../../../../../../core/services/school-user.service';
import { TeachingCategoryService } from '../../../../../../core/services/teaching-category.service';
import { TeachingCategory } from '../../../../../../models/interfaces/teaching-category.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../../../../../../core/services/config.service';

@Component({
  selector: 'app-school-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './school-details.component.html',
  styleUrls: ['./school-details.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SchoolDetailsComponent implements OnInit, OnDestroy {
  schoolId!: number;
  school: AutoSchool | null = null;
  requests: SchoolRequest[] = [];
  instructors: SchoolUser[] = [];
  students: SchoolUser[] = [];
  teachingCategories: TeachingCategory[] = [];

  // Search properties
  studentSearchTerm: string = '';
  instructorSearchTerm: string = '';
  filteredStudents: SchoolUser[] = [];
  filteredInstructors: SchoolUser[] = [];

  // Pagination properties
  pageSize: number = 10;

  // Requests pagination
  requestsCurrentPage: number = 1;
  totalRequestsPages: number = 1;
  paginatedRequests: SchoolRequest[] = [];

  // Instructors pagination
  instructorsCurrentPage: number = 1;
  totalInstructorsPages: number = 1;
  paginatedInstructors: SchoolUser[] = [];

  // Students pagination
  studentsCurrentPage: number = 1;
  totalStudentsPages: number = 1;
  paginatedStudents: SchoolUser[] = [];

  isLoading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autoSchoolService: AutoSchoolService,
    private requestService: RequestService,
    private schoolUserService: SchoolUserService,
    private teachingCategoryService: TeachingCategoryService,
    private dialog: MatDialog,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.schoolId = +id;
        this.loadSchoolData();
      } else {
        this.router.navigate(['/dashboard/super-admin/schools']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadSchoolData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Get school details
    this.subscription.add(
      // Using getAutoSchools and filtering for the specific school as a workaround
      // since getAutoSchool doesn't exist in the AutoSchoolService
      this.autoSchoolService.getAutoSchools().subscribe({
        next: (schools: AutoSchool[]) => {
          const school = schools.find(s => s.autoSchoolId === this.schoolId);
          if (school) {
            this.school = school;
            // After getting school details, load other data
            this.loadRelatedData();
          } else {
            this.errorMessage = 'School not found.';
            this.isLoading = false;
          }
        },
        error: (error: any) => {
          console.error('Error loading school details:', error);
          this.errorMessage = 'Error loading school details. Please try again.';
          this.isLoading = false;
        }
      })
    );
  }

  loadRelatedData(): void {
    // Load requests, instructors and students in parallel
    console.log('Loading related data for school ID:', this.schoolId);

    this.subscription.add(
      forkJoin({
        requests: this.requestService.fetchSchoolRequests(this.schoolId).pipe(
          catchError(error => {
            console.error('Error loading requests:', error);
            return of([]);
          })
        ),
        instructors: this.schoolUserService.getSchoolInstructors(this.schoolId).pipe(
          catchError(error => {
            console.error('Error loading instructors:', error);
            return of([]);
          })
        ),
        students: this.schoolUserService.getSchoolStudents(this.schoolId).pipe(
          catchError(error => {
            console.error('Error loading students:', error);
            return of([]);
          })
        ),
        teachingCategories: this.teachingCategoryService.getTeachingCategories(this.schoolId).pipe(
          catchError(error => {
            console.error('Error loading teaching categories:', error);
            return of([]);
          })
        )
      }).subscribe({
        next: (result) => {
          console.log('API responses received');
          this.requests = result.requests || [];
          this.instructors = result.instructors || [];
          this.students = result.students || [];
          this.teachingCategories = result.teachingCategories || [];

          // Initialize filtered arrays
          this.filteredStudents = [...this.students];
          this.filteredInstructors = [...this.instructors];

          // Initialize pagination
          this.updateRequestsPagination();
          this.updateInstructorsPagination();
          this.updateStudentsPagination();

          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading related data:', error);
          this.errorMessage = 'Error loading school data. Some information may be incomplete.';
          this.isLoading = false;
        }
      })
    );
  }

  // Format address for display
  formatAddress(school: AutoSchool): string {
    if (!school || !school.address) {
      return 'Address not available';
    }

    const address = school.address;

    // Handle potential undefined or null values in the address object
    const streetName = address.streetName || '';
    const addressNumber = address.addressNumber || '';
    const cityName = address.city?.name || '';
    const countyName = address.city?.county?.name || '';
    const postcode = address.postcode || '';

    return `${streetName} ${addressNumber}, ${cityName}, ${countyName}, ${postcode}`.trim().replace(/, ,/g, ',').replace(/,$/g, '');
  }

  // Get status class for styling
  getStatusClass(status: string | undefined | null): string {
    if (!status) {
      return 'pending'; // Default status class if status is undefined or null
    }

    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'restricted':
        return 'restricted';
      case 'demo':
        return 'demo';
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return '';
    }
  }

  // Get color for request status
  getRequestStatusColor(status: string | undefined | null): string {
    if (!status) {
      return 'pending'; // Default status if status is undefined or null
    }

    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      default:
        return '';
    }
  }

  // Delete school
  deleteSchool(): void {
    if (!this.school) return;

    // Import the DeleteConfirmationDialogComponent
    import('../../../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component')
      .then(({ DeleteConfirmationDialogComponent }) => {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
          data: {
            name: this.school?.name,
            type: 'School'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.isLoading = true;
            this.errorMessage = null;
            this.subscription.add(
              this.autoSchoolService.deleteAutoSchool(this.schoolId).subscribe({
                next: () => {
                  this.successMessage = 'School deleted successfully!';
                  this.isLoading = false;
                  // Navigate back to schools list after short delay
                  setTimeout(() => {
                    this.router.navigate(['/dashboard/super-admin/schools']);
                  }, 1500);
                },
                error: (error: any) => {
                  console.error('Error deleting school:', error);
                  this.errorMessage = error.error?.message || 'Error deleting school.';
                  this.isLoading = false;
                }
              })
            );
          }
        });
      });
  }

  // Navigate back to schools list
  goBack(): void {
    this.router.navigate(['/dashboard/super-admin/schools']);
  }

  // Helper method to get API URL for debugging
  getApiUrl(): string {
    try {
      return this.configService ? this.configService.getApiBaseUrl() : 'ConfigService not available';
    } catch (error) {
      return 'Error getting API URL';
    }
  }

  // Filter students based on search term
  filterStudents(): void {
    const term = this.studentSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredStudents = [...this.students];
    } else {
      this.filteredStudents = this.students.filter(student =>
        student.firstName.toLowerCase().includes(term) ||
        student.lastName.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term)
      );
    }

    // Reset pagination when filtering
    this.studentsCurrentPage = 1;
    this.updateStudentsPagination();
  }

  // Filter instructors based on search term
  filterInstructors(): void {
    const term = this.instructorSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredInstructors = [...this.instructors];
    } else {
      this.filteredInstructors = this.instructors.filter(instructor =>
        instructor.firstName.toLowerCase().includes(term) ||
        instructor.lastName.toLowerCase().includes(term) ||
        instructor.phone.toLowerCase().includes(term)
      );
    }

    // Reset pagination when filtering
    this.instructorsCurrentPage = 1;
    this.updateInstructorsPagination();
  }

  // Update pagination for requests table
  updateRequestsPagination(): void {
    this.totalRequestsPages = Math.ceil(this.requests.length / this.pageSize);
    this.totalRequestsPages = this.totalRequestsPages === 0 ? 1 : this.totalRequestsPages;

    const startIndex = (this.requestsCurrentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.requests.length);
    this.paginatedRequests = this.requests.slice(startIndex, endIndex);
  }

  // Update pagination for instructors table
  updateInstructorsPagination(): void {
    this.totalInstructorsPages = Math.ceil(this.filteredInstructors.length / this.pageSize);
    this.totalInstructorsPages = this.totalInstructorsPages === 0 ? 1 : this.totalInstructorsPages;

    const startIndex = (this.instructorsCurrentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredInstructors.length);
    this.paginatedInstructors = this.filteredInstructors.slice(startIndex, endIndex);
  }

  // Update pagination for students table
  updateStudentsPagination(): void {
    this.totalStudentsPages = Math.ceil(this.filteredStudents.length / this.pageSize);
    this.totalStudentsPages = this.totalStudentsPages === 0 ? 1 : this.totalStudentsPages;

    const startIndex = (this.studentsCurrentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredStudents.length);
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
  }

  // Change page for requests
  changeRequestsPage(page: number): void {
    if (page >= 1 && page <= this.totalRequestsPages) {
      this.requestsCurrentPage = page;
      this.updateRequestsPagination();
    }
  }

  // Change page for instructors
  changeInstructorsPage(page: number): void {
    if (page >= 1 && page <= this.totalInstructorsPages) {
      this.instructorsCurrentPage = page;
      this.updateInstructorsPagination();
    }
  }

  // Change page for students
  changeStudentsPage(page: number): void {
    if (page >= 1 && page <= this.totalStudentsPages) {
      this.studentsCurrentPage = page;
      this.updateStudentsPagination();
    }
  }

  // Generate school page URL
  getSchoolPageUrl(): string {
    if (!this.school) return '';

    // Get base URL (removes any paths)
    const baseUrl = window.location.origin;

    // Format school name for URL
    const schoolSlug = this.school.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, '-');     // Replace spaces with hyphens

    return `${baseUrl}/school/${this.schoolId}/${schoolSlug}`;
  }

  // Open school page in new tab
  openSchoolPage(): void {
    const url = this.getSchoolPageUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Copy school page URL to clipboard
  copySchoolPageUrl(): void {
    const url = this.getSchoolPageUrl();
    if (url) {
      navigator.clipboard.writeText(url)
        .then(() => {
          // Show success message temporarily
          this.successMessage = 'School page URL copied to clipboard!';
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
          this.errorMessage = 'Failed to copy URL to clipboard.';
          setTimeout(() => {
            this.errorMessage = null;
          }, 3000);
        });
    }
  }
}
