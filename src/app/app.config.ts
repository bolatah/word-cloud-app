import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {  provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { wordCloudReducer } from './state/word-cloud.reducer';
import { WordCloudEffects } from './state/word-cloud.effects';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';


export const appConfig: ApplicationConfig = {
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'})),
    provideAnimations(),
    provideStore({ wordClouds: wordCloudReducer }),
    // provideState({name : 'wordCloud', reducer: wordCloudReducer}),
    provideEffects([WordCloudEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
