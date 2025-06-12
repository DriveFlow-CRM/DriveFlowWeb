import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCategoryDialogComponent } from './assign-category-dialog.component';

describe('AssignCategoryDialogComponent', () => {
  let component: AssignCategoryDialogComponent;
  let fixture: ComponentFixture<AssignCategoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCategoryDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignCategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
