import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { PublicNavbarComponent } from '../../../../shared/components/public-navbar/public-navbar.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SchoolService } from '../../../../core/services/school.service';
import { School, TeachingCategory, Address } from '../../../../core/models/school.model';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../../../core/services/config.service';

interface DrivingCategory {
  categ: string;
  descriere: string;
}

@Component({
  selector: 'app-school-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PublicNavbarComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './school-profile.component.html',
  styleUrl: './school-profile.component.css'
})
export class SchoolProfileComponent implements OnInit, OnDestroy {
  school: School | null = null;
  isLoading = true;
  error = false;
  showEnrollmentModal = false;
  enrollmentForm: FormGroup;
  drivingCategories: DrivingCategory[] = [];
  formSubmitted = false;
  isSubmitting = false;
  currentYear = new Date().getFullYear();
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' | null = null;
  private subscription = new Subscription();
  private apiUrl: string;
  private schoolId: string = '';

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeEnrollmentModal();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService,
    private titleService: Title,
    private metaService: Meta,
    private fb: FormBuilder,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.getApiBaseUrl();
    this.enrollmentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNr: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      drivingCategory: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDrivingCategories();

    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        const schoolId = params.get('id');
        if (schoolId) {
          this.schoolId = schoolId;
          this.loadSchool(schoolId);
        } else {
          this.router.navigate(['/']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openEnrollmentModal(): void {
    this.showEnrollmentModal = true;
    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = 'hidden';
    // Reset notification when opening modal
    this.notificationMessage = null;
    this.notificationType = null;
  }

  closeEnrollmentModal(): void {
    this.showEnrollmentModal = false;
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = 'auto';
  }

  getFullAddress(): string {
    if (!this.school) return '';

    if (typeof this.school.address === 'string') {
      return this.school.address;
    }

    if (this.school.address) {
      return `${this.school.address.streetName} ${this.school.address.addressNumber}, ${this.school.address.city}, ${this.school.address.county} ${this.school.address.postcode}`;
    }

    return '';
  }

  getPhoneNumber(): string {
    return this.school?.phoneNumber || (this.school?.phone || '');
  }

  getWebsite(): string {
    return this.school?.website || (this.school?.webSite || '');
  }

  hasWebsite(): boolean {
    return !!this.getWebsite();
  }

  getWebsiteUrl(): string {
    const website = this.getWebsite();
    return website.startsWith('http') ? website : `https://${website}`;
  }

  getCity(): string {
    if (!this.school) return '';

    if (typeof this.school.address === 'string') {
      return this.school.city || '';
    }

    return this.school.address?.city || this.school.city || '';
  }

  getCounty(): string {
    if (!this.school) return '';

    if (typeof this.school.address === 'string') {
      return this.school.state || '';
    }

    return this.school.address?.county || this.school.state || '';
  }

  getAvailableCategories(): string {
    if (!this.school) return '';

    if (!this.school.teachingCategories || this.school.teachingCategories.length === 0) {
      return this.school.coursesOffered?.join(', ') || '';
    }

    return this.school.teachingCategories
      .filter(tc => tc.licenseType)
      .map(tc => `Categoria ${tc.licenseType}`)
      .join(', ');
  }

  loadDrivingCategories(): void {
    this.subscription.add(
      this.http.get<DrivingCategory[]>('assets/data/driving-categories.json')
        .subscribe({
          next: (data) => {
            this.drivingCategories = data;
          },
          error: (err) => {
            console.error('Error loading driving categories:', err);
          }
        })
    );
  }

  loadSchool(id: string): void {
    this.isLoading = true;
    this.error = false;

    this.subscription.add(
      this.schoolService.getSchoolById(id).subscribe({
        next: (school) => {
          if (school) {
            this.school = school;
            this.updateMetaTags();

            // Store the school ID for enrollment requests
            this.schoolId = school.id?.toString() || school.autoSchoolId?.toString() || id;

            if (school.teachingCategories && school.teachingCategories.length > 0) {
              this.drivingCategories = school.teachingCategories
                .filter(tc => tc.licenseType !== null)
                .map(tc => ({
                  categ: tc.licenseType as string,
                  descriere: `${tc.sessionDuration} minute/sesiune, minim ${tc.minDrivingLessonsReq} lecții`
                }));
            }
          } else {
            this.error = true;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading school:', err);
          this.error = true;
          this.isLoading = false;
        }
      })
    );
  }

  submitEnrollment(): void {
    this.formSubmitted = true;
    this.notificationMessage = null;
    this.notificationType = null;

    if (this.enrollmentForm.valid && this.schoolId) {
      this.isSubmitting = true;

      // Extract only the required fields in the specified format
      const formData = {
        firstName: this.enrollmentForm.value.firstName,
        lastName: this.enrollmentForm.value.lastName,
        phoneNr: this.enrollmentForm.value.phoneNr,
        drivingCategory: this.enrollmentForm.value.drivingCategory
      };

      console.log('Sending enrollment request:', formData);

      // Set headers for the API request
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      // Make the API call to the correct endpoint
      this.subscription.add(
        this.http.post(`${this.apiUrl}request/school/${this.schoolId}/createRequest`, formData, {
          headers,
          responseType: 'text'
        })
          .subscribe({
            next: (response) => {
              console.log('Enrollment request successful:', response);
              this.isSubmitting = false;
              this.enrollmentForm.reset();
              this.formSubmitted = false;

              // Show success notification
              this.notificationMessage = 'Cererea a fost trimisă cu succes. Vă rugăm să așteptați să fiți contactat.';
              this.notificationType = 'success';

              // Close modal after 3 seconds
              setTimeout(() => {
                this.closeEnrollmentModal();
              }, 3000);
            },
            error: (error) => {
              console.error('Enrollment request failed:', error);
              this.isSubmitting = false;

              // Show error notification
              this.notificationMessage = 'A apărut o eroare la trimiterea cererii. Vă rugăm să încercați din nou.';
              this.notificationType = 'error';
            }
          })
      );
    }
  }

  private updateMetaTags(): void {
    if (this.school) {
      this.titleService.setTitle(`${this.school.name} | DriveFlow`);
      this.metaService.updateTag({ name: 'description', content: this.school.description });
      this.metaService.updateTag({ property: 'og:title', content: this.school.name });
      this.metaService.updateTag({ property: 'og:description', content: this.school.description });
      this.metaService.updateTag({ property: 'og:url', content: window.location.href });
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
      this.metaService.updateTag({ name: 'twitter:title', content: this.school.name });
      this.metaService.updateTag({ name: 'twitter:description', content: this.school.description });
    }
  }
}
