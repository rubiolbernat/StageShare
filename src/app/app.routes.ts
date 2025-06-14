import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: 'land',
  loadChildren: () => import('./landing/landing.routes').then(m => m.LANDING_ROUTES),
  pathMatch: 'prefix'
}, {
  path: '',
  loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  pathMatch: 'prefix'
}, {
  path: '**',
  redirectTo: ''
}
];
