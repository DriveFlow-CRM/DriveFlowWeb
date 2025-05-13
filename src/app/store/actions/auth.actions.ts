import { createAction, props } from '@ngrx/store';
import { User } from '../models/auth.model';

// Login
export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User; token: string; refreshToken: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// Logout
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Check Auth Status
export const checkAuthStatus = createAction('[Auth] Check Auth Status');
export const authStatusChecked = createAction('[Auth] Auth Status Checked', props<{ isAuthenticated: boolean; user: User | null }>());

// Refresh Token
export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success', props<{ token: string; refreshToken: string }>());
export const refreshTokenFailure = createAction('[Auth] Refresh Token Failure', props<{ error: string }>());
