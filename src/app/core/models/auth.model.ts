export interface AuthResponse {
  token: string;
  refreshToken: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  userType: string;
  userId: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}
