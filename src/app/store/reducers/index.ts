import { isDevMode } from '@angular/core';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as fromAuth from './auth.reducer';
import { AuthState } from '../models/auth.model';

export interface AppState {
  auth: AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer
};

export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
