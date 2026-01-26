import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authInterceptor } from './core/interceptors/auth-interceptor.service';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { reducers, metaReducers } from './store/reducers';
import { effects } from './store/effects';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Interceptor order: loading (start) -> auth (add token) -> error (handle errors)
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideStore(reducers, { metaReducers }),
    provideEffects(effects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    // Global error handler for unhandled exceptions
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
