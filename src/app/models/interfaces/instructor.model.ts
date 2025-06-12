// Instructor Models

export interface Instructor {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType?: string;
  role?: string;
  cnp?: string | null;
  schoolId?: number;
}

export interface CreateInstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  teachingCategoryIds: number[];
}

export interface UpdateInstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  teachingCategoryIds: number[];
}

export interface InstructorDetails extends Omit<Instructor, 'teachingCategories'> {
  teachingCategories: {
    teachingCategoryId: number;
    licenseType: string;
  }[];
}
