import { Routes } from "@angular/router";
import { DashboardLayout } from "../layout/dashboard-layout/dashboard-layout";
import { HomePage } from "./home-page/home-page";
import { Venues } from "./venues/venues";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: HomePage
      },
      {
        path: 'venue',
        component: Venues
      },
      {
        path: 'venues',
        loadComponent: () => import('./venues/venues').then(m => m.Venues)
      }
    ]
  }
]
