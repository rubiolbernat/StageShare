import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: '',
  loadChildren: () => import('./landing/landing.routes').then(m => m.LANDING_ROUTES),
  pathMatch: 'prefix'
}, {
  path: 'd',
  loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  pathMatch: 'prefix'
}, {
  path: '**',
  redirectTo: ''
}
];
