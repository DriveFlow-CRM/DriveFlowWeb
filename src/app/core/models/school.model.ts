import { SchoolStatus } from '../types/school.types';

export interface School {
  autoSchoolId: number;
  name: string;
  city: string;
  county: string;
  status: string;
  description: string;
  email: string;
  phoneNumber?: string;
  website?: string;
  address?: Address;
  foundedYear?: number;
  instructorCount?: number;
  studentCount?: number;
  pricingDetails?: string;
  // Legacy fields for backward compatibility
  id?: string;
  state?: string;
  zip?: string;
  phone?: string;
  webSite?: string;
  teachingCategories?: TeachingCategory[];
  coursesOffered?: string[];
}

export interface SchoolListing {
  id: number;
  name: string;
  description: string;
  status: SchoolStatus;
}

export interface Address {
  streetName: string;
  addressNumber: string;
  postcode: string;
  city: string;
  county: string;
  countyAbbreviation: string;
}

export interface Vehicle {
  licensePlateNumber: string;
  transmissionType: string;
  color: string;
  licenseType: string | null;
}

export interface TeachingCategory {
  licenseType: string | null;
  sessionDuration: number;
  minDrivingLessonsReq: number;
}
