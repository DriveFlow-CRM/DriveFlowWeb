import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AutoSchoolService, AutoSchool } from '../../../../../../core/services/auto-school.service';
import { RequestService, SchoolRequest } from '../../../../../../core/services/request.service';
import { SchoolUserService, SchoolUser } from '../../../../../../core/services/school-user.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
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
        )
      }).subscribe({
        next: (result) => {
          console.log('API responses received');
          this.requests = result.requests || [];
          this.instructors = result.instructors || [];
          this.students = result.students || [];
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
}
