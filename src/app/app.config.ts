import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEsPy from '@angular/common/locales/es-PY';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { ReviewsApi } from './core/api/reviews-api';
import { authInterceptor } from './core/auth/auth.interceptor';
import { MockReviewsApi } from './mocks/reviews-api.mock';

// Números a la paraguaya: coma decimal y punto de miles.
registerLocaleData(localeEsPy);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-PY' },
    // PROTOTIPO: la publicación es simulada hasta la tarea 3.3, que enlaza aquí la implementación HTTP.
    { provide: ReviewsApi, useClass: MockReviewsApi },
  ],
};
