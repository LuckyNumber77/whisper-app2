import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./tabs/map.page').then((m) => m.MapPage),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./tabs/contacts.page').then((m) => m.ContactsPage),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./tabs/alerts.page').then((m) => m.AlertsPage),
      },
      {
        path: 'sos',
        loadComponent: () =>
          import('./tabs/sos.page').then((m) => m.SosPage),
      },
    ],
  },
];
