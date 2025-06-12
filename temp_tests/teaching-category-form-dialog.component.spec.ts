import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingCategoryFormDialogComponent } from './teaching-category-form-dialog.component';

describe('TeachingCategoryFormDialogComponent', () => {
  let component: TeachingCategoryFormDialogComponent;
  let fixture: ComponentFixture<TeachingCategoryFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachingCategoryFormDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeachingCategoryFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
