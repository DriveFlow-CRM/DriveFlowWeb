import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState, User } from '../models/auth.model';

/**
 * Feature selector for auth state
 */
export const selectAuthState = createFeatureSelector<AuthState>('auth');

/**
 * Select whether user is authenticated
 */
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState): boolean => state.isAuthenticated
);

/**
 * Select current user
 */
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState): User | null => state.user
);

/**
 * Select auth loading state
 */
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState): boolean => state.loading
);

/**
 * Select auth error
 */
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState): string | null => state.error
);

/**
 * Select user type/role
 */
export const selectUserType = createSelector(
  selectUser,
  (user: User | null): string | null => user?.userType ?? null
);

/**
 * Select user's full name
 */
export const selectUserFullName = createSelector(
  selectUser,
  (user: User | null): string | null => 
    user ? `${user.firstName} ${user.lastName}` : null
);

/**
 * Select user's school ID
 */
export const selectUserSchoolId = createSelector(
  selectUser,
  (user: User | null): number | null => user?.schoolId ?? null
);

/**
 * Select user's email
 */
export const selectUserEmail = createSelector(
  selectUser,
  (user: User | null): string | null => user?.userEmail ?? null
);

/**
 * Select if user has a specific role
 */
export const selectHasRole = (role: string) => createSelector(
  selectUserType,
  (userType: string | null): boolean => userType === role
);

/**
 * Select if user is SuperAdmin
 */
export const selectIsSuperAdmin = selectHasRole('SuperAdmin');

/**
 * Select if user is SchoolAdmin
 */
export const selectIsSchoolAdmin = selectHasRole('SchoolAdmin');

/**
 * Select if user is Instructor
 */
export const selectIsInstructor = selectHasRole('Instructor');

/**
 * Select if user is Student
 */
export const selectIsStudent = selectHasRole('Student');
