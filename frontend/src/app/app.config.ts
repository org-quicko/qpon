import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    RxFormBuilder,
    {
      provide: MatIconRegistry,
      useClass: MatIconRegistry,
    },
    {
      provide: 'ICON_REGISTRATION',
      useFactory: registerIcons,
      deps: [MatIconRegistry, DomSanitizer],
    }
  ],
};

export function registerIcons(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
  iconRegistry.addSvgIcon('regime_preference', sanitizer.bypassSecurityTrustResourceUrl('/assets/regime_preference.svg'));
}