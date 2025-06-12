import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorFormDialogComponent } from './instructor-form-dialog.component';

describe('InstructorFormDialogComponent', () => {
  let component: InstructorFormDialogComponent;
  let fixture: ComponentFixture<InstructorFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorFormDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstructorFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
