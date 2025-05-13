// Authentication Models

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  userType: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  userPhone: string;
  schoolId: number;
}

export interface User {
  userId: string;
  userType: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  userPhone: string;
  schoolId: number;
}
