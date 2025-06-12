export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cnp: string;
  address: string;
  autoSchoolId: number;
}

export interface CreateStudentRequest {
  student: {
    firstName: string;
    lastName: string;
    email: string;
    cnp: string;
    phone: string;
    password: string;
  };
  payment: {
    scholarshipBasePayment: boolean;
    sessionsPayed: number;
  };
  file: {
    scholarshipStartDate: string;
    criminalRecordExpiryDate: string;
    medicalRecordExpiryDate: string;
    status: string;
    instructorId: string | null;
    vehicleId: number | null;
    teachingCategoryId: number | null;
  };
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  cnp: string;
  phone: string;
  password?: string;
}
