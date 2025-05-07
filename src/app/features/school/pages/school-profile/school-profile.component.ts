import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { PublicNavbarComponent } from '../../../../shared/components/public-navbar/public-navbar.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SchoolService } from '../../../../core/services/school.service';
import { School, TeachingCategory, Address } from '../../../../core/models/school.model';

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
export class SchoolProfileComponent implements OnInit {
  school: School | null = null;
  isLoading = true;
  error = false;
  showEnrollmentForm = false;
  enrollmentForm: FormGroup;
  drivingCategories: DrivingCategory[] = [];
  formSubmitted = false;
  currentYear = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService,
    private titleService: Title,
    private metaService: Meta,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.enrollmentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNr: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      drivingCategory: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDrivingCategories();

    this.route.paramMap.subscribe(params => {
      const schoolId = params.get('id');
      if (schoolId) {
        this.loadSchool(schoolId);
      } else {
        this.router.navigate(['/']);
      }
    });
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
    this.http.get<DrivingCategory[]>('assets/data/driving-categories.json')
      .subscribe({
        next: (data) => {
          this.drivingCategories = data;
        },
        error: (err) => {
          console.error('Error loading driving categories:', err);
        }
      });
  }

  loadSchool(id: string): void {
    this.isLoading = true;
    this.error = false;

    this.schoolService.getSchoolById(id).subscribe({
      next: (school) => {
        if (school) {
          this.school = school;
          this.updateMetaTags();

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
    });
  }

  toggleEnrollmentForm(): void {
    this.showEnrollmentForm = !this.showEnrollmentForm;
  }

  submitEnrollment(): void {
    this.formSubmitted = true;

    if (this.enrollmentForm.valid && this.school) {
      const formData = {
        ...this.enrollmentForm.value,
        schoolId: this.school.id || this.school.autoSchoolId.toString()
      };

      console.log('Enrollment data:', formData);
      this.enrollmentForm.reset();
      this.formSubmitted = false;
      this.showEnrollmentForm = false;
      alert('Cererea de înscriere a fost trimisă cu succes!');
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
