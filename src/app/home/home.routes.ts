import { Routes } from '@angular/router';
import { TabsPage } from '@pages/home/tabs/tabs.page';  // Use @pages alias for consistency

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
          import('@pages/home/tabs/map/map.component').then((m) => m.MapComponent),  // Alias for lazy load
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('@pages/home/tabs/contacts/contacts.component').then((m) => m.ContactsComponent),  // Alias for lazy load
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('@pages/home/tabs/alerts/alerts.component').then((m) => m.AlertsComponent),  // Alias for lazy load
      },
      {
        path: 'sos',
        loadComponent: () =>
          import('@pages/home/tabs/sos/sos.component').then((m) => m.SosComponent),  // Alias for lazy load
      },
    ],
  },
];