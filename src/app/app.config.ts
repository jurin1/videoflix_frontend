// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'; // BrowserAnimationsModule und provideAnimations importieren
import { ToastrModule, provideToastr } from 'ngx-toastr'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule, BrowserAnimationsModule, ToastrModule.forRoot()), // BrowserAnimationsModule und ToastrModule.forRoot() importieren
    provideAnimations(), 
    provideToastr({  
      timeOut: 4000, 
      preventDuplicates: true,
      // disableTimeOut: true,
    })
  ]
};