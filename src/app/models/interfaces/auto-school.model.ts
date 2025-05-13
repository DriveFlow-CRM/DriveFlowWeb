// Auto School Models

export interface County {
  countyId: number;
  name: string;
  abbreviation: string;
}

export interface City {
  cityId: number;
  name: string;
  county: County;
}

export interface Address {
  addressId: number;
  streetName: string;
  addressNumber: string;
  postcode: string;
  city: City;
}

export interface SchoolAdmin {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface AutoSchool {
  autoSchoolId: number;
  name: string;
  description: string;
  webSite: string;
  phoneNumber: string;
  email: string;
  status: 'active' | 'restricted' | 'demo';
  address: Address;
  addressId?: number;
  schoolAdmin: SchoolAdmin;
}

export interface CreateAutoSchoolRequest {
  autoSchool: {
    name: string;
    description: string;
    webSite: string;
    phoneNumber: string;
    email: string;
    status: 'active' | 'restricted' | 'demo';
    addressId: number;
  };
  schoolAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
}

export interface UpdateAutoSchoolRequest {
  name: string;
  description: string;
  webSite: string;
  phoneNumber: string;
  email: string;
  status: 'active' | 'restricted' | 'demo';
  addressId: number;
}

export interface UpdateSchoolAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}
