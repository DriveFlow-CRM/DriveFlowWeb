export interface StudentFile {
  fileId: number;
  status: string;
  firstName: string;
  lastName: string;
  type: string;
}

export interface StudentFileDetails {
  fileId: number;
  status: string;
  scholarshipStartDate: string;
  criminalRecordExpiryDate: string;
  medicalRecordExpiryDate: string;
  payment: PaymentInfo;
  instructor: InstructorInfo;
  vehicle?: VehicleInfo;
  appointments: Appointment[];
  appointmentsCompleted: number;
}

export interface PaymentInfo {
  scholarshipPayment: boolean;
  sessionsPayed: number;
}

export interface InstructorInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface VehicleInfo {
  licensePlateNumber: string;
  transmissionType: string;
  color: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  fuelType: string;
  engineSizeLiters: number;
  powertrainType: string;
  type: string;
}

export interface Appointment {
  appointmentId: number;
  date: string;
  startHour: string;
  endHour: string;
  status: string;
}
