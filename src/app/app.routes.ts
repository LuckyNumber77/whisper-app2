// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // 1) Default: send to Welcome
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },

  // 2) Welcome & Onboarding
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

  // 3) Sign–up sequence
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

  // 4) Log-in
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then(m => m.LoginPage),
  },

  // 5) Forgot Password — MUST come *before* the wildcard
  {
    path: 'forgot',
    loadComponent: () =>
      import('./pages/auth/forgot/forgot/forgot.page').then(m => m.ForgotPage),
  },

  // 6) Protected Home/Tabs area (only MapLegacy for now)
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/home/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      // Redirect /home → /home/map-legacy
      { path: '', redirectTo: 'map-legacy', pathMatch: 'full' },

      // Map tab → MapLegacyPage
      {
        path: 'map-legacy',
        loadComponent: () =>
          import('./pages/map-legacy/map-legacy.page').then(
            m => m.MapLegacyPage
          ),
      },
    ],
  },
  {
  path: 'profile',
  canActivate: [AuthGuard],
  loadComponent: () =>
    import('./pages/account/profile/profile.page').then(m => m.ProfilePage),
},


  // 7) Catch-all: redirect to Welcome
  { path: '**', redirectTo: 'welcome' },
];
