import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LicenseService, License } from '../../../../../../core/services/license.service';
import { AutoSchoolService } from '../../../../../../core/services/auto-school.service';
import { StudentService } from '../../../../../../core/services/student.service';
import { InstructorService } from '../../../../../../core/services/instructor.service';
import { AutoSchool } from '../../../../../../models/interfaces/auto-school.model';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  // Statistics data
  totalSchools = 0;
  totalStudents = 0;
  totalInstructors = 0;
  monthlyRevenue = 0; // Set to 0 as requested

  // Loading states
  isLoadingStats = false;

  // License management
  licenses: License[] = [];
  isLoading = false;
  showLicenseCard = false;
  showLicenseForm = false;
  isCreating = true;
  licenseForm: FormGroup;
  selectedLicense: License | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // School creation modal
  showCreateSchoolModal = false;

  private subscription = new Subscription();

  constructor(
    private cdr: ChangeDetectorRef,
    private licenseService: LicenseService,
    private autoSchoolService: AutoSchoolService,
    private studentService: StudentService,
    private instructorService: InstructorService,
    private fb: FormBuilder
  ) {
    this.licenseForm = this.fb.group({
      type: ['', [Validators.required, Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
    console.log('Overview component OnInit - checking if content renders');
    this.loadStatistics();
    // Force refresh to ensure content renders
    setTimeout(() => {
      console.log('Manual ChangeDetection triggered');
      this.cdr.detectChanges();
    }, 0);
  }

  ngAfterViewInit(): void {
    console.log('Overview component AfterViewInit');
    // Check if DOM elements are properly rendered
    setTimeout(() => {
      const container = document.querySelector('.overview-container');
      console.log('Overview container found:', !!container);

      // Check for material icons
      const icons = document.querySelectorAll('.material-icons');
      console.log('Material icons found:', icons.length);

      // Force another change detection cycle after view init
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadStatistics(): void {
    this.isLoadingStats = true;

    // Get all schools first
    this.subscription.add(
      this.autoSchoolService.getAutoSchools().subscribe({
        next: (schools: AutoSchool[]) => {
          this.totalSchools = schools.length;

          // Now get students and instructors for each school
          if (schools.length > 0) {
            this.loadStudentsAndInstructors(schools);
          } else {
            this.isLoadingStats = false;
          }
        },
        error: (error) => {
          console.error('Error loading schools:', error);
          this.isLoadingStats = false;
        }
      })
    );
  }

  loadStudentsAndInstructors(schools: AutoSchool[]): void {
    const studentRequests = schools.map(school =>
      this.studentService.getStudents(school.autoSchoolId)
    );

    const instructorRequests = schools.map(school =>
      this.instructorService.getInstructors(school.autoSchoolId)
    );

    // Execute all requests in parallel
    this.subscription.add(
      forkJoin([
        forkJoin(studentRequests),
        forkJoin(instructorRequests)
      ]).subscribe({
        next: ([studentsArrays, instructorsArrays]) => {
          // Count total students across all schools
          this.totalStudents = studentsArrays.reduce((total, students) => total + students.length, 0);

          // Count total instructors across all schools
          this.totalInstructors = instructorsArrays.reduce((total, instructors) => total + instructors.length, 0);

          this.isLoadingStats = false;
        },
        error: (error) => {
          console.error('Error loading students and instructors:', error);
          this.isLoadingStats = false;
        }
      })
    );
  }

  openCreateSchoolModal(): void {
    this.showCreateSchoolModal = true;
  }

  closeCreateSchoolModal(): void {
    this.showCreateSchoolModal = false;
  }

  toggleLicenseCard(): void {
    this.showLicenseCard = !this.showLicenseCard;
    if (this.showLicenseCard) {
      this.loadLicenses();
    }
  }

  loadLicenses(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.subscription.add(
      this.licenseService.getLicenses().subscribe({
        next: (data) => {
          this.licenses = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading licenses:', error);
          this.errorMessage = 'Error loading licenses. Please try again.';
          this.isLoading = false;
        }
      })
    );
  }

  openCreateForm(): void {
    this.licenseForm.reset();
    this.isCreating = true;
    this.selectedLicense = null;
    this.showLicenseForm = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  openEditForm(license: License): void {
    this.licenseForm.setValue({
      type: license.type
    });
    this.isCreating = false;
    this.selectedLicense = license;
    this.showLicenseForm = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelForm(): void {
    this.showLicenseForm = false;
    this.licenseForm.reset();
  }

  submitLicenseForm(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.licenseForm.valid) {
      const licenseData = { type: this.licenseForm.value.type };

      if (this.isCreating) {
        this.subscription.add(
          this.licenseService.createLicense(licenseData).subscribe({
            next: () => {
              this.successMessage = 'License created successfully.';
              this.loadLicenses();
              this.showLicenseForm = false;
              this.licenseForm.reset();
            },
            error: (error) => {
              console.error('Error creating license:', error);
              this.errorMessage = error.error?.message || 'Error creating license. Type may already exist.';
            }
          })
        );
      } else if (this.selectedLicense) {
        this.subscription.add(
          this.licenseService.updateLicense(this.selectedLicense.licenseId, licenseData).subscribe({
            next: () => {
              this.successMessage = 'License updated successfully.';
              this.loadLicenses();
              this.showLicenseForm = false;
              this.licenseForm.reset();
            },
            error: (error) => {
              console.error('Error updating license:', error);
              this.errorMessage = error.error?.message || 'Error updating license. Type may already exist.';
            }
          })
        );
      }
    }
  }

  deleteLicense(license: License): void {
    if (confirm(`Are you sure you want to delete license type ${license.type}?`)) {
      this.subscription.add(
        this.licenseService.deleteLicense(license.licenseId).subscribe({
          next: () => {
            this.successMessage = 'License deleted successfully.';
            this.loadLicenses();
          },
          error: (error) => {
            console.error('Error deleting license:', error);
            this.errorMessage = error.error?.message || 'Error deleting license.';
          }
        })
      );
    }
  }
}
