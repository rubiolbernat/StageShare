import { Routes } from "@angular/router";
import { DashboardLayout } from "../layout/dashboard-layout/dashboard-layout";
import { HomePage } from "./home-page/home-page";

export const DASHBOARD_ROUTES: Routes =[
  {
    path: '',
    component: DashboardLayout,
    children:[
      {
        path: '',
        component: HomePage
      }
    ]
  }
]
