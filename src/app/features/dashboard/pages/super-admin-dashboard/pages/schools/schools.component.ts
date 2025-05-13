import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule, Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AutoSchoolService } from '../../../../../../core/services/auto-school.service';
import { AutoSchool, CreateAutoSchoolRequest, UpdateAutoSchoolRequest, UpdateSchoolAdminRequest, County, City, Address } from '../../../../../../models/interfaces/auto-school.model';
import { LocationService, AddressCreateDto, AddressUpdateDto } from '../../../../../../core/services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatStepperModule, MatDialogModule, RouterModule],
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SchoolsComponent implements OnInit, OnDestroy {
  // Schools data
  schools: AutoSchool[] = [];
  filteredSchools: AutoSchool[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;
  isLoading: boolean = false;

  // Location data
  counties: County[] = [];
  cities: City[] = [];
  addresses: Address[] = [];
  filteredCities: City[] = [];
  filteredAddresses: Address[] = [];

  // UI state
  showCreateForm: boolean = false;
  showEditForm: boolean = false;
  showEditAdminForm: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  passwordVisible: boolean = false;
  editPasswordVisible: boolean = false;

  // Selected items
  selectedSchool: AutoSchool | null = null;
  selectedAdmin: any = null;

  // Forms
  schoolForm: FormGroup;
  adminForm: FormGroup;
  locationForm: FormGroup;
  addressForm: FormGroup;

  // Form control getters for direct access in template
  get countyIdControl(): FormControl {
    return this.locationForm.get('countyId') as FormControl;
  }

  get cityIdControl(): FormControl {
    return this.locationForm.get('cityId') as FormControl;
  }

  get streetNameControl(): FormControl {
    return this.addressForm.get('streetName') as FormControl;
  }

  get addressNumberControl(): FormControl {
    return this.addressForm.get('addressNumber') as FormControl;
  }

  get postcodeControl(): FormControl {
    return this.addressForm.get('postcode') as FormControl;
  }

  private subscription = new Subscription();

  constructor(
    private autoSchoolService: AutoSchoolService,
    private locationService: LocationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.schoolForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      webSite: ['', [Validators.required, Validators.pattern('https?://.+')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
      email: ['', [Validators.required, Validators.email]],
      status: ['active', Validators.required]
    });

    this.locationForm = this.fb.group({
      countyId: [null, Validators.required],
      cityId: [null, Validators.required]
    });

    this.addressForm = this.fb.group({
      streetName: ['', Validators.required],
      addressNumber: ['', Validators.required],
      postcode: ['', Validators.required]
    });

    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
      password: ['', [Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.loadSchools();
    this.loadCounties();

    // Check for query parameters to handle returning from details page
    this.subscription.add(
      this.route.queryParamMap.subscribe((params: ParamMap) => {
        const editSchoolId = params.get('edit');
        const editAdminId = params.get('admin');

        if (editSchoolId) {
          // Find the school to edit
          const schoolId = +editSchoolId;
          this.findAndEditSchool(schoolId);
        }

        if (editAdminId) {
          // Find the school admin to edit
          const schoolId = +editAdminId;
          this.findAndEditSchoolAdmin(schoolId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadSchools(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.subscription.add(
      this.autoSchoolService.getAutoSchools().subscribe({
        next: (data) => {
          this.schools = data;
          this.filterSchools();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading schools:', error);
          this.errorMessage = 'Error loading schools. Please try again.';
          this.isLoading = false;
        }
      })
    );
  }

  // Location data loading methods
  loadCounties(): void {
    this.subscription.add(
      this.locationService.getCounties().subscribe({
        next: (data) => {
          this.counties = data;
        },
        error: (error) => {
          console.error('Error loading counties:', error);
          this.errorMessage = 'Error loading location data. Please try again.';
        }
      })
    );
  }

  loadCities(countyId: number): void {
    if (!countyId) return;

    this.subscription.add(
      this.locationService.getCities(countyId).subscribe({
        next: (data) => {
          this.filteredCities = data;
          this.locationForm.get('cityId')?.setValue(null);
        },
        error: (error) => {
          console.error('Error loading cities:', error);
        }
      })
    );
  }

  loadAddresses(cityId: number): void {
    if (!cityId) return;

    this.subscription.add(
      this.locationService.getAddresses(cityId).subscribe({
        next: (data) => {
          this.filteredAddresses = data;
        },
        error: (error) => {
          console.error('Error loading addresses:', error);
        }
      })
    );
  }

  onCountyChange(): void {
    const countyId = this.locationForm.get('countyId')?.value;
    if (countyId) {
      this.loadCities(countyId);
    }
  }

  onCityChange(): void {
    const cityId = this.locationForm.get('cityId')?.value;
    if (cityId) {
      this.loadAddresses(cityId);
    }
  }

  // Format address for display
  formatAddress(address: Address): string {
    return `${address.streetName} ${address.addressNumber}, ${address.city.name}, ${address.city.county.name}`;
  }

  // Format county display
  formatCounty(county: County): string {
    return `${county.name}, ${county.abbreviation}`;
  }

  // Get the complete address object
  getAddressById(addressId: number): Address | undefined {
    return this.filteredAddresses.find(address => address.addressId === addressId);
  }

  // Prepare form for address selection based on an existing address
  setLocationForAddress(address: Address): void {
    if (!address) return;

    // Reset forms first
    this.locationForm.reset();
    this.addressForm.reset();

    // Find the county first
    const countyId = address.city.county.countyId;
    this.locationForm.get('countyId')?.setValue(countyId);

    // Load and set cities for this county
    this.loadCities(countyId);
    setTimeout(() => {
      // Set the city after cities are loaded
      this.locationForm.get('cityId')?.setValue(address.city.cityId);

      // Load addresses for this city
      this.loadAddresses(address.city.cityId);
      setTimeout(() => {
        // Set the address form values
        this.addressForm.patchValue({
          streetName: address.streetName,
          addressNumber: address.addressNumber,
          postcode: address.postcode
        });
      }, 300);
    }, 300);
  }

  filterSchools(): void {
    const search = this.searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredSchools = [...this.schools];
    } else {
      this.filteredSchools = this.schools.filter(school =>
        school.name.toLowerCase().includes(search) ||
        school.email.toLowerCase().includes(search) ||
        school.address.city.name.toLowerCase().includes(search)
      );
    }

    this.totalPages = Math.ceil(this.filteredSchools.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.filterSchools();
  }

  getCurrentPageItems(): AutoSchool[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSchools.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'restricted':
        return 'restricted';
      case 'demo':
        return 'demo';
      default:
        return '';
    }
  }

  // Create school
  openCreateForm(): void {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.showEditAdminForm = false;
    this.schoolForm.reset();
    this.locationForm.reset();
    this.addressForm.reset();
    this.adminForm.reset();
    this.schoolForm.patchValue({
      status: 'active'
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Edit school
  openEditForm(school: AutoSchool): void {
    this.selectedSchool = school;
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showEditAdminForm = false;
    this.errorMessage = null;
    this.successMessage = null;

    this.schoolForm.patchValue({
      name: school.name,
      description: school.description,
      webSite: school.webSite,
      phoneNumber: school.phoneNumber,
      email: school.email,
      status: school.status
    });

    // Set the location form with the school's address
    this.setLocationForAddress(school.address);
  }

  // Edit admin
  openEditAdminForm(school: AutoSchool): void {
    this.selectedSchool = school;
    this.selectedAdmin = school.schoolAdmin;
    this.showEditAdminForm = true;
    this.showCreateForm = false;
    this.showEditForm = false;
    this.errorMessage = null;
    this.successMessage = null;

    this.adminForm.patchValue({
      firstName: school.schoolAdmin.firstName,
      lastName: school.schoolAdmin.lastName,
      email: school.schoolAdmin.email,
      phone: school.schoolAdmin.phone,
      password: '' // Password is optional for updates
    });

    // Make password optional for updates
    const passwordControl = this.adminForm.get('password');
    if (passwordControl) {
      passwordControl.setValidators([]);
      passwordControl.updateValueAndValidity();
    }
  }

  closeForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.showEditAdminForm = false;
    this.selectedSchool = null;
    this.selectedAdmin = null;
    this.schoolForm.reset();
    this.locationForm.reset();
    this.addressForm.reset();
    this.adminForm.reset();
  }

  createAddressAndSubmitForm(isUpdate: boolean = false): void {
    if (!this.addressForm.valid || !this.locationForm.valid) return;

    const addressData: AddressCreateDto = {
      streetName: this.addressForm.value.streetName,
      addressNumber: this.addressForm.value.addressNumber,
      postcode: this.addressForm.value.postcode,
      cityId: this.locationForm.value.cityId
    };

    this.isLoading = true;
    this.subscription.add(
      this.locationService.createAddress(addressData).subscribe({
        next: (response) => {
          // Now we have the new address ID, we can create/update the school
          if (isUpdate) {
            this.submitEditFormWithAddressId(response.addressId);
          } else {
            this.submitCreateFormWithAddressId(response.addressId);
          }
        },
        error: (error) => {
          console.error('Error creating address:', error);
          this.errorMessage = 'Error creating address. Please check your inputs.';
          this.isLoading = false;
        }
      })
    );
  }

  submitCreateForm(): void {
    if (!this.schoolForm.valid || !this.adminForm.valid || !this.locationForm.valid || !this.addressForm.valid) {
      return;
    }

    // Create a new address first, then create the school with the new address ID
    this.createAddressAndSubmitForm(false);
  }

  submitCreateFormWithAddressId(addressId: number): void {
    const request: CreateAutoSchoolRequest = {
      autoSchool: {
        name: this.schoolForm.value.name,
        description: this.schoolForm.value.description,
        webSite: this.schoolForm.value.webSite,
        phoneNumber: this.schoolForm.value.phoneNumber,
        email: this.schoolForm.value.email,
        status: this.schoolForm.value.status,
        addressId: addressId
      },
      schoolAdmin: {
        firstName: this.adminForm.value.firstName,
        lastName: this.adminForm.value.lastName,
        email: this.adminForm.value.email,
        phone: this.adminForm.value.phone,
        password: this.adminForm.value.password
      }
    };

    this.subscription.add(
      this.autoSchoolService.createAutoSchool(request).subscribe({
        next: () => {
          this.successMessage = 'School created successfully!';
          this.loadSchools();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating school:', error);
          this.errorMessage = error.error?.message || 'Error creating school. Please check your inputs.';
          this.isLoading = false;
        }
      })
    );
  }

  submitEditForm(): void {
    if (!this.schoolForm.valid || !this.selectedSchool || !this.locationForm.valid || !this.addressForm.valid) {
      return;
    }

    // Update the existing address first, then update the school
    this.updateExistingAddress();
  }

  updateExistingAddress(): void {
    if (!this.selectedSchool || !this.addressForm.valid || !this.locationForm.valid) return;

    const addressId = this.selectedSchool.address.addressId;
    const updateAddressData: AddressUpdateDto = {
      streetName: this.addressForm.value.streetName,
      addressNumber: this.addressForm.value.addressNumber,
      postcode: this.addressForm.value.postcode,
      cityId: this.locationForm.value.cityId
    };

    this.isLoading = true;
    this.subscription.add(
      this.locationService.updateAddress(addressId, updateAddressData).subscribe({
        next: () => {
          // Now update the school with the same address ID
          this.submitEditFormWithAddressId(addressId);
        },
        error: (error: any) => {
          console.error('Error updating address:', error);
          this.errorMessage = 'Error updating address. Please check your inputs.';
          this.isLoading = false;
        }
      })
    );
  }

  submitEditFormWithAddressId(addressId: number): void {
    const request: UpdateAutoSchoolRequest = {
      name: this.schoolForm.value.name,
      description: this.schoolForm.value.description,
      webSite: this.schoolForm.value.webSite,
      phoneNumber: this.schoolForm.value.phoneNumber,
      email: this.schoolForm.value.email,
      status: this.schoolForm.value.status,
      addressId: addressId
    };

    this.subscription.add(
      this.autoSchoolService.updateAutoSchool(this.selectedSchool!.autoSchoolId, request).subscribe({
        next: () => {
          this.successMessage = 'School updated successfully!';
          this.loadSchools();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating school:', error);
          this.errorMessage = error.error?.message || 'Error updating school. Please check your inputs.';
          this.isLoading = false;
        }
      })
    );
  }

  submitEditAdminForm(): void {
    if (!this.adminForm.valid || !this.selectedAdmin) {
      return;
    }

    const request: UpdateSchoolAdminRequest = {
      firstName: this.adminForm.value.firstName,
      lastName: this.adminForm.value.lastName,
      email: this.adminForm.value.email,
      phone: this.adminForm.value.phone
    };

    // Only include password if it's provided (non-empty)
    if (this.adminForm.value.password) {
      request.password = this.adminForm.value.password;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.subscription.add(
      this.autoSchoolService.updateSchoolAdmin(this.selectedAdmin.userId, request).subscribe({
        next: () => {
          this.successMessage = 'School admin updated successfully!';
          this.loadSchools();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating school admin:', error);
          this.errorMessage = error.error?.message || 'Error updating school admin. Please check your inputs.';
          this.isLoading = false;
        }
      })
    );
  }

  deleteSchool(school: AutoSchool): void {
    // Import the DeleteConfirmationDialogComponent
    import('../../../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component')
      .then(({ DeleteConfirmationDialogComponent }) => {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
          data: {
            name: school.name,
            type: 'School'
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.isLoading = true;
            this.errorMessage = null;
            this.subscription.add(
              this.autoSchoolService.deleteAutoSchool(school.autoSchoolId).subscribe({
                next: () => {
                  this.successMessage = 'School deleted successfully!';
                  this.loadSchools();
                  this.isLoading = false;
                },
                error: (error) => {
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

  // Helper functions for pagination
  getPaginationArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // First three, current page and surrounding, last three
  getVisiblePages(): number[] {
    const visiblePages = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Always include page 1
      visiblePages.push(1);

      // Add dots if current page is far from beginning
      if (currentPage > 3) {
        visiblePages.push(-1); // -1 represents dots (...)
      }

      // Add pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        visiblePages.push(i);
      }

      // Add dots if current page is far from end
      if (currentPage < totalPages - 2) {
        visiblePages.push(-1);
      }

      // Always include last page
      visiblePages.push(totalPages);
    }

    return visiblePages;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleEditPasswordVisibility(): void {
    this.editPasswordVisible = !this.editPasswordVisible;
  }

  // Helper methods to find and edit schools from query params
  findAndEditSchool(schoolId: number): void {
    // Wait for schools to load first if they haven't yet
    if (this.schools.length === 0) {
      const sub = this.autoSchoolService.getAutoSchools().subscribe({
        next: (schools) => {
          const school = schools.find(s => s.autoSchoolId === schoolId);
          if (school) {
            this.openEditForm(school);
          }
          sub.unsubscribe();
        },
        error: (error) => {
          console.error('Error finding school to edit:', error);
          sub.unsubscribe();
        }
      });
    } else {
      const school = this.schools.find(s => s.autoSchoolId === schoolId);
      if (school) {
        this.openEditForm(school);
      }
    }
  }

  findAndEditSchoolAdmin(schoolId: number): void {
    // Wait for schools to load first if they haven't yet
    if (this.schools.length === 0) {
      const sub = this.autoSchoolService.getAutoSchools().subscribe({
        next: (schools) => {
          const school = schools.find(s => s.autoSchoolId === schoolId);
          if (school) {
            this.openEditAdminForm(school);
          }
          sub.unsubscribe();
        },
        error: (error) => {
          console.error('Error finding school admin to edit:', error);
          sub.unsubscribe();
        }
      });
    } else {
      const school = this.schools.find(s => s.autoSchoolId === schoolId);
      if (school) {
        this.openEditAdminForm(school);
      }
    }
  }
}
