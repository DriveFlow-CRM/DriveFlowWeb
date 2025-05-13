import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../models/auth.model';
import * as AuthActions from '../actions/auth.actions';

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

export const authReducer = createReducer(
  initialState,
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
    isAuthenticated: true
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.logoutSuccess, () => ({
    ...initialState
  })),

  // Auth Status
  on(AuthActions.checkAuthStatus, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.authStatusChecked, (state, { isAuthenticated, user }) => ({
    ...state,
    isAuthenticated,
    user,
    loading: false
  })),

  // Refresh Token
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.refreshTokenSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false,
    user: null
  }))
);
