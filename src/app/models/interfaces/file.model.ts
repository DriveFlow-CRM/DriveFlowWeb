export interface StudentFile {
  fileId: number;
  scholarshipStartDate: string;
  criminalRecordExpiryDate: string;
  medicalRecordExpiryDate: string;
  status: string;
  teachingCategory: TeachingCategory;
  vehicle: Vehicle;
  instructor: InstructorInfo;
  payment: Payment;
}

export interface FileWithStudent {
  studentData: StudentData;
  files: StudentFile[];
}

export interface StudentData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cnp: string;
  address: string;
  autoSchoolId: number;
}

export interface TeachingCategory {
  teachingCategoryId: number;
  sessionCost: number;
  sessionDuration: number;
  scholarshipPrice: number;
  minDrivingLessonsReq: number;
  licenseType: string;
}

export interface Vehicle {
  vehicleId: number;
  licensePlateNumber: string;
  transmissionType: string;
  color: string;
}

export interface InstructorInfo {
  instructorId: number | string;
  firstName: string;
  lastName: string;
}

export interface Payment {
  paymentId: number;
  sessionsPayed: number;
  scholarshipBasePayment: boolean;
}

export interface CreateFileRequest {
  scholarshipStartDate: string;
  criminalRecordExpiryDate: string;
  medicalRecordExpiryDate: string;
  status: string;
  teachingCategoryId: number | null;
  vehicleId: number | null;
  instructorId: string | null;
  payment: {
    sessionsPayed: number;
    scholarshipBasePayment: boolean;
  };
}

export interface EditFileRequest {
  scholarshipStartDate: string;
  criminalRecordExpiryDate: string;
  medicalRecordExpiryDate: string;
  status: string;
  instructorId: string | null;
  vehicleId: number | null;
  teachingCategoryId: number | null;
}

export interface EditPaymentRequest {
  scholarshipBasePayment: boolean;
  sessionsPayed: number;
}

export interface FileCreationResponse {
  fileId: number;
  paymentId: number;
  message: string;
}
