// Teaching Category Models

export interface TeachingCategory {
  teachingCategoryId: number;
  licenseId: number;
  licenseType: string;
  sessionCost: number;
  sessionDuration: number;
  scholarshipPrice: number;
  minDrivingLessonsReq: number;
}

export interface CreateTeachingCategoryRequest {
  licenseId: number;
  sessionCost: number;
  sessionDuration: number;
  scholarshipPrice: number;
  minDrivingLessonsReq: number;
}

export interface UpdateTeachingCategoryRequest {
  licenseId: number;
  sessionCost: number;
  sessionDuration: number;
  scholarshipPrice: number;
  minDrivingLessonsReq: number;
}

export interface ApplicationUserTeachingCategory {
  applicationUserTeachingCategoryId: number;
  teachingCategoryId: number;
  code?: string;
  licenseId: number;
  licenseType: string;
  sessionCost: number;
  sessionDuration: number;
  scholarshipPrice: number;
  minDrivingLessonsReq: number;
}

export interface InstructorTeachingCategory {
  applicationUserTeachingCategoryId: number;
  instructorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface CreateApplicationUserTeachingCategoryRequest {
  instructorId: string;
  teachingCategoryId: number;
}
