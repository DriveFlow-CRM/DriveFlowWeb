import { TestBed } from '@angular/core/testing';

import { SchoolUserService } from './school-user.service';

describe('SchoolUserService', () => {
  let service: SchoolUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchoolUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
