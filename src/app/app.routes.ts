import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // 1) Default: send to Welcome
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },

  // 2) Welcome & Onboarding flow
  {
    path: 'welcome',
    loadComponent: () =>
      import('./pages/auth/welcome/welcome.page').then(m => m.WelcomePage),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/auth/onboarding/onboarding.page').then(
        m => m.OnboardingPage
      ),
  },

  // 3) Sign–up sequence (Create → Phone → Verify)
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/auth/create/create.page').then(m => m.CreatePage),
  },
  {
    path: 'phone',
    loadComponent: () =>
      import('./pages/auth/phone/phone.page').then(m => m.PhonePage),
  },
  {
    path: 'verify',
    loadComponent: () =>
      import('./pages/auth/verify/verify.page').then(m => m.VerifyPage),
  },

  // 4) Log-in (email/password or social)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then(m => m.LoginPage),
  },

  // 5) Protected Home/Tabs area
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/home/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'map',
        loadComponent: () =>
          import('./pages/home/tabs/map/map.component').then(
            m => m.MapComponent
          ),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./pages/home/tabs/contacts/contacts.component').then(
            m => m.ContactsComponent
          ),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./pages/home/tabs/alerts/alerts.component').then(
            m => m.AlertsComponent
          ),
      },
      {
        path: 'sos',
        loadComponent: () =>
          import('./pages/home/tabs/sos/sos.component').then(
            m => m.SosComponent
          ),
      },
      {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
      },
    ],
  },

  // 6) Catch-all: redirect to Welcome
  {
    path: '**',
    redirectTo: 'welcome',
  },
];
