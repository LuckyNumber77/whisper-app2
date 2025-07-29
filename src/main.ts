import { addIcons } from 'ionicons';
import {
  businessOutline,
  mapOutline,
  calendarOutline,
  funnelOutline
} from 'ionicons/icons';

addIcons({
  'business-outline': businessOutline,
  'map-outline': mapOutline,
  'calendar-outline': calendarOutline,
  'funnel-outline': funnelOutline,
});

import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { register } from 'swiper/element/bundle';
register();

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
}).catch(err => console.error('Bootstrap error:', err));
