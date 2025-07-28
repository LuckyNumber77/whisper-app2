import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'map',
        loadComponent: () =>
          import('./pages/map-legacy/map-legacy.page').then((m) => m.MapLegacyPage),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./pages/home/tabs/contacts/contacts.component').then((m) => m.ContactsComponent),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./pages/home/tabs/alerts/alerts.component').then((m) => m.AlertsComponent),
      },
      {
        path: 'sos',
        loadComponent: () =>
          import('./pages/home/tabs/sos/sos.component').then((m) => m.SosComponent),
      },
      {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
