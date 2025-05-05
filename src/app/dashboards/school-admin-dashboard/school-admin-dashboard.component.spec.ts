import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolAdminDashboardComponent } from './school-admin-dashboard.component';

describe('SchoolAdminDashboardComponent', () => {
  let component: SchoolAdminDashboardComponent;
  let fixture: ComponentFixture<SchoolAdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolAdminDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchoolAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
