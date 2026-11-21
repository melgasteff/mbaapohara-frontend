import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEsPy from '@angular/common/locales/es-PY';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { HttpReviewsApi } from './core/api/http-reviews-api';
import { ReviewsApi } from './core/api/reviews-api';
import { authInterceptor } from './core/auth/auth.interceptor';

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
    // Publicación real (tarea 3.3). El simulador de src/app/mocks queda para las pruebas de los componentes.
    { provide: ReviewsApi, useClass: HttpReviewsApi },
  ],
};
