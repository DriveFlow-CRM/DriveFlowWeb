export interface EnrollmentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  address: string;
  city: string;
  state: string;
  zip: string;
  licenseNumber?: string;
  permitNumber?: string;
  courseId?: number;
  preferredStartDate?: Date;
  preferredTimeSlot?: string;
  message?: string;
  schoolId: number;
}
