export interface InstructorAvailability {
  intervalId: number;
  date: string;
  startHour: string;
  endHour: string;
}

export interface CreateAvailabilityRequest {
  date: string;
  startHour: string;
  endHour: string;
}

export interface UpdateAvailabilityRequest {
  date: string;
  startHour: string;
  endHour: string;
}

export interface InstructorAppointment {
  appointmentId: number;
  date: string;
  startHour: string;
  endHour: string;
  fileId: number;
  firstName: string;
  lastName: string;
  phoneNo: string;
  licensePlateNumber: string;
  type: string;
}

export interface InstructorAssignedFile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  scholarshipStartDate: string;
  licensePlateNumber: string;
  transmissionType: string;
  status: string;
  type: string;
  color: string;
}

export interface FileDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  scholarshipStartDate: string;
  criminalRecordExpiryDate: string;
  medicalRecordExpiryDate: string;
  status: string;
  scholarshipPayment: boolean;
  sessionsPayed: number;
  minDrivingLessonsRequired: number;
  lessonsMade: string[];
}
