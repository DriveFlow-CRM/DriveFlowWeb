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
  payment: {
    scholarshipPayment: boolean;
    sessionsPayed: number;
  };
  instructor: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  vehicle?: {
    licensePlateNumber: string;
    transmissionType: string;
    color: string;
    type: string;
  };
  appointments: Appointment[];
  appointmentsCompleted: number;
}

export interface Appointment {
  appointmentId: number;
  date: string;
  startHour: string;
  endHour: string;
  status: string;
}
