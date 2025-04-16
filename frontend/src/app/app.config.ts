import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
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
    ReactiveFormsModule,
    RxFormBuilder,
    {
      provide: MatIconRegistry,
      useClass: MatIconRegistry,
    },
    {
      provide: 'ICON_REGISTRATION',
      useFactory: registerIcons,
      deps: [MatIconRegistry, DomSanitizer],
    },
    provideAnimationsAsync(),
  ],
};

export function registerIcons(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
  iconRegistry.addSvgIcon('regime_preference', sanitizer.bypassSecurityTrustResourceUrl('/assets/regime_preference.svg'));
  iconRegistry.addSvgIcon('discount', sanitizer.bypassSecurityTrustResourceUrl('/assets/discount.svg'));
  iconRegistry.addSvgIcon('autofill', sanitizer.bypassSecurityTrustResourceUrl('/assets/autofill.svg'));
}