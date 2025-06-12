import { TestBed } from '@angular/core/testing';

import { DashboardGuardService } from './dashboard-guard.service';

describe('DashboardGuardService', () => {
  let service: DashboardGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
