import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });

    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should not be loading initially', () => {
      expect(service.isLoading).toBe(false);
    });
  });

  describe('startLoading', () => {
    it('should set loading to true', () => {
      service.startLoading();
      expect(service.isLoading).toBe(true);
    });

    it('should increment request count', (done) => {
      service.startLoading();
      service.loading$.subscribe(state => {
        expect(state.requestCount).toBe(1);
        done();
      });
    });
  });

  describe('stopLoading', () => {
    it('should set loading to false when no pending requests', () => {
      service.startLoading();
      service.stopLoading();
      expect(service.isLoading).toBe(false);
    });

    it('should keep loading true when there are pending requests', () => {
      service.startLoading();
      service.startLoading();
      service.stopLoading();
      expect(service.isLoading).toBe(true);
    });

    it('should decrement request count', (done) => {
      service.startLoading();
      service.startLoading();
      service.stopLoading();
      
      service.loading$.subscribe(state => {
        expect(state.requestCount).toBe(1);
        done();
      });
    });

    it('should not go below 0 request count', (done) => {
      service.stopLoading();
      service.stopLoading();
      
      service.loading$.subscribe(state => {
        expect(state.requestCount).toBe(0);
        done();
      });
    });
  });

  describe('show/hide aliases', () => {
    it('show should be alias for startLoading', () => {
      service.show();
      expect(service.isLoading).toBe(true);
    });

    it('hide should be alias for stopLoading', () => {
      service.show();
      service.hide();
      expect(service.isLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset loading state completely', (done) => {
      service.startLoading();
      service.startLoading();
      service.startLoading();
      
      service.reset();
      
      service.loading$.subscribe(state => {
        expect(state.isLoading).toBe(false);
        expect(state.requestCount).toBe(0);
        done();
      });
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests', () => {
      // Simulate 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        service.startLoading();
      }
      expect(service.isLoading).toBe(true);

      // Complete 4 requests
      for (let i = 0; i < 4; i++) {
        service.stopLoading();
      }
      expect(service.isLoading).toBe(true);

      // Complete last request
      service.stopLoading();
      expect(service.isLoading).toBe(false);
    });
  });
});
