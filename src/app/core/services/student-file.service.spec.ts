import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { 
  StudentFileService, 
  AvailableSlotsResponse, 
  MistakeStats, 
  FileStats,
  SessionFormSummary,
  SessionFormDetails,
  SessionFormsPaginatedResponse
} from './student-file.service';
import { ConfigService } from './config.service';
import { ErrorHandlerService } from './error-handler.service';
import { StudentFile, StudentFileDetails } from '../../models/interfaces/student-file.model';

describe('StudentFileService', () => {
  let service: StudentFileService;
  let httpMock: HttpTestingController;
  let configServiceMock: jest.Mocked<ConfigService>;
  let errorHandlerMock: jest.Mocked<ErrorHandlerService>;

  const mockApiUrl = 'https://api.test.com/api/';

  const mockStudentFile: StudentFile = {
    fileId: 1,
    status: 'active',
    type: 'B',
    firstName: 'Test',
    lastName: 'Student'
  };

  const mockStudentFileDetails: StudentFileDetails = {
    fileId: 1,
    status: 'active',
    scholarshipStartDate: '2025-01-01',
    criminalRecordExpiryDate: '2026-01-01',
    medicalRecordExpiryDate: '2025-06-01',
    payment: {
      scholarshipPayment: true,
      sessionsPayed: 10
    },
    instructor: {
      userId: 'inst-1',
      firstName: 'John',
      lastName: 'Instructor',
      email: 'instructor@test.com',
      phone: '+40123456789',
      role: 'Instructor'
    },
    vehicle: {
      licensePlateNumber: 'B-123-XYZ',
      transmissionType: 'MANUAL',
      color: 'white',
      brand: 'Dacia',
      model: 'Logan',
      yearOfProduction: 2022,
      fuelType: 'BENZINA',
      engineSizeLiters: 1.6,
      powertrainType: 'COMBUSTIBIL',
      type: 'B'
    },
    appointments: [],
    appointmentsCompleted: 5
  };

  const mockAvailableSlots: AvailableSlotsResponse = {
    sessionDuration: 60,
    availableSlots: [
      { startHour: '09:00', endHour: '10:00' },
      { startHour: '10:00', endHour: '11:00' }
    ]
  };

  const mockMistakeStats: MistakeStats = {
    series: [
      { date: '2025-01-01', totalPoints: 10, topItems: [{ id_item: 1, count: 2 }] }
    ],
    heatmap: {
      items: [1, 2, 3],
      sessions: [1, 2],
      counts: [[1, 2], [0, 1]]
    },
    movingAverage: [
      { date: '2025-01-01', avg: 10.5 }
    ]
  };

  const mockSessionFormSummary: SessionFormSummary = {
    id: 501,
    date: '2025-10-12',
    totalPoints: 18,
    maxPoints: 21,
    result: 'PASSED'
  };

  const mockSessionFormDetails: SessionFormDetails = {
    id: 501,
    appointmentDate: '2025-10-12',
    studentName: 'Test Student',
    instructorName: 'Test Instructor',
    totalPoints: 18,
    maxPoints: 21,
    result: 'PASSED',
    mistakes: [
      { id_item: 1, description: 'Test mistake', count: 2, penaltyPoints: 6 }
    ],
    isLocked: true
  };

  beforeEach(() => {
    configServiceMock = {
      getApiBaseUrl: jest.fn().mockReturnValue(mockApiUrl),
      getApiUrl: jest.fn()
    } as unknown as jest.Mocked<ConfigService>;

    errorHandlerMock = {
      handleHttpError: jest.fn().mockImplementation(error => {
        throw error;
      })
    } as unknown as jest.Mocked<ErrorHandlerService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StudentFileService,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    });

    service = TestBed.inject(StudentFileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getStudentFiles', () => {
    it('should fetch student files', (done) => {
      const studentId = 'student-1';
      const mockFiles = [mockStudentFile];

      service.getStudentFiles(studentId).subscribe({
        next: (files) => {
          expect(files).toEqual(mockFiles);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}student/${studentId}/files`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFiles);
    });

    it('should handle errors', (done) => {
      const studentId = 'student-1';

      errorHandlerMock.handleHttpError.mockImplementation(() => {
        throw new Error('API Error');
      });

      service.getStudentFiles(studentId).subscribe({
        error: (error) => {
          expect(error.message).toBe('API Error');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}student/${studentId}/files`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getFileDetails', () => {
    it('should fetch file details', (done) => {
      const fileId = 1;

      service.getFileDetails(fileId).subscribe({
        next: (details) => {
          expect(details).toEqual(mockStudentFileDetails);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}student/file-details/${fileId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudentFileDetails);
    });
  });

  describe('getFileInvoice', () => {
    it('should fetch invoice as blob', (done) => {
      const fileId = 1;
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      service.getFileInvoice(fileId).subscribe({
        next: (blob) => {
          expect(blob).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}accounting/file/${fileId}/invoice`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('getAvailableSlots', () => {
    it('should fetch available slots with provided date', (done) => {
      const fileId = 1;
      const date = '2025-02-15';

      service.getAvailableSlots(fileId, date).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAvailableSlots);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${mockApiUrl}student/files/${fileId}/available-slots?date=${date}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAvailableSlots);
    });

    it('should use tomorrow date when no date provided', (done) => {
      const fileId = 1;

      service.getAvailableSlots(fileId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAvailableSlots);
          done();
        }
      });

      // Check that the request was made with a date parameter
      const req = httpMock.expectOne(req => 
        req.url.includes(`student/files/${fileId}/available-slots`) && 
        req.params.has('date')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAvailableSlots);
    });
  });

  describe('createFileAppointment', () => {
    it('should create appointment', (done) => {
      const fileId = 1;
      const appointmentData = {
        date: '2025-02-15',
        startHour: '09:00',
        endHour: '10:00'
      };

      service.createFileAppointment(fileId, appointmentData).subscribe({
        next: (response) => {
          expect(response).toEqual({ success: true });
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}student/files/${fileId}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(appointmentData);
      req.flush({ success: true });
    });
  });

  describe('getMistakeStats', () => {
    const studentId = 'student-1';

    it('should fetch mistake stats without options', (done) => {
      service.getMistakeStats(studentId).subscribe({
        next: (stats) => {
          expect(stats).toEqual(mockMistakeStats);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}student/${studentId}/stats/mistakes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMistakeStats);
    });

    it('should include from/to parameters when provided', (done) => {
      const options = { from: '2025-01-01', to: '2025-01-31' };

      service.getMistakeStats(studentId, options).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`student/${studentId}/stats/mistakes`) &&
        req.params.get('from') === '2025-01-01' &&
        req.params.get('to') === '2025-01-31'
      );
      req.flush(mockMistakeStats);
    });

    it('should include fileId parameter when provided', (done) => {
      const options = { fileId: 1 };

      service.getMistakeStats(studentId, options).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`student/${studentId}/stats/mistakes`) &&
        req.params.get('fileId') === '1'
      );
      req.flush(mockMistakeStats);
    });

    it('should return FileStats array when no fileId provided', (done) => {
      const mockFileStats: FileStats[] = [
        { fileId: 1, stats: mockMistakeStats },
        { fileId: 2, stats: mockMistakeStats }
      ];

      service.getMistakeStats(studentId).subscribe({
        next: (stats) => {
          expect(Array.isArray(stats)).toBe(true);
          expect((stats as FileStats[]).length).toBe(2);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}student/${studentId}/stats/mistakes`);
      req.flush(mockFileStats);
    });
  });

  describe('getSessionForms', () => {
    const studentId = 'student-1';

    it('should fetch session forms without options', (done) => {
      const mockResponse: SessionFormsPaginatedResponse = {
        page: 1,
        pageSize: 20,
        total: 1,
        items: [mockSessionFormSummary]
      };

      service.getSessionForms(studentId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}students/${studentId}/session-forms`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include pagination parameters', (done) => {
      const options = { page: 2, pageSize: 10 };

      service.getSessionForms(studentId, options).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`students/${studentId}/session-forms`) &&
        req.params.get('page') === '2' &&
        req.params.get('pageSize') === '10'
      );
      req.flush({ page: 2, pageSize: 10, total: 1, items: [] });
    });

    it('should include fileId and return array format', (done) => {
      const options = { fileId: 1 };
      const mockArray: SessionFormSummary[] = [mockSessionFormSummary];

      service.getSessionForms(studentId, options).subscribe({
        next: (response) => {
          expect(Array.isArray(response)).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`students/${studentId}/session-forms`) &&
        req.params.get('fileId') === '1'
      );
      req.flush(mockArray);
    });

    it('should include date range parameters', (done) => {
      const options = { from: '2025-01-01', to: '2025-01-31' };

      service.getSessionForms(studentId, options).subscribe({
        next: () => done()
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`students/${studentId}/session-forms`) &&
        req.params.get('from') === '2025-01-01' &&
        req.params.get('to') === '2025-01-31'
      );
      req.flush({ page: 1, pageSize: 20, total: 0, items: [] });
    });
  });

  describe('getSessionFormDetails', () => {
    it('should fetch session form details', (done) => {
      const formId = 501;

      service.getSessionFormDetails(formId).subscribe({
        next: (details) => {
          expect(details).toEqual(mockSessionFormDetails);
          expect(details.mistakes.length).toBe(1);
          expect(details.isLocked).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}session-forms/${formId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSessionFormDetails);
    });

    it('should handle form with no mistakes', (done) => {
      const formId = 502;
      const formWithNoMistakes = { ...mockSessionFormDetails, id: 502, mistakes: [] };

      service.getSessionFormDetails(formId).subscribe({
        next: (details) => {
          expect(details.mistakes).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}session-forms/${formId}`);
      req.flush(formWithNoMistakes);
    });

    it('should handle errors', (done) => {
      const formId = 999;

      errorHandlerMock.handleHttpError.mockImplementation(() => {
        throw new Error('Not found');
      });

      service.getSessionFormDetails(formId).subscribe({
        error: (error) => {
          expect(error.message).toBe('Not found');
          done();
        }
      });

      const req = httpMock.expectOne(`${mockApiUrl}session-forms/${formId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
