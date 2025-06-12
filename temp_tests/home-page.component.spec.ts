import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomePageComponent } from './home-page.component';
import { AuthService } from '../../../../core/services/auth.service';
import { SchoolService, SchoolListing } from '../../../../core/services/school.service';
import { PublicNavbarComponent } from '../../../../shared/components/public-navbar/public-navbar.component';
import { SchoolCardComponent } from '../../../../shared/components/school-card/school-card.component';
import { of } from 'rxjs';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let schoolService: jasmine.SpyObj<SchoolService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated$']);
    const schoolSpy = jasmine.createSpyObj('SchoolService', ['getSchoolsListing']);

    await TestBed.configureTestingModule({
      imports: [
        HomePageComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        PublicNavbarComponent,
        SchoolCardComponent
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: SchoolService, useValue: schoolSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    schoolService = TestBed.inject(SchoolService) as jasmine.SpyObj<SchoolService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load schools on init', () => {
    const mockSchools: SchoolListing[] = [
      {
        id: 1,
        name: 'School 1',
        description: 'Test school 1',
        status: 'Active'
      },
      {
        id: 2,
        name: 'School 2',
        description: 'Test school 2',
        status: 'Active'
      }
    ];

    schoolService.getSchoolsListing.and.returnValue(of(mockSchools));
    fixture.detectChanges();
    expect(component.schools).toEqual(mockSchools);
    expect(component.isLoadingSchools).toBeFalse();
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
  });

  it('should handle swipe gestures', () => {
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100 } as Touch]
    });
    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 200 } as Touch]
    });

    component.handleTouchStart(touchStartEvent);
    component.handleTouchEnd(touchEndEvent);

    expect(component.touchStartX).toBe(100);
    expect(component.touchEndX).toBe(200);
  });
});
