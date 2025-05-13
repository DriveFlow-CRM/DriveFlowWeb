export interface User {
  userId: string;
  userType: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  userPhone: string;
  schoolId: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
