import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./pages/home/tabs/tabs.page').then((m) => m.TabsPage),
  },
  {
    path: 'map-legacy',
    loadComponent: () =>
      import('./pages/map-legacy/map-legacy.page').then((m) => m.MapLegacyPage),
  },
];
