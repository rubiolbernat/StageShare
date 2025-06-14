import { Routes } from "@angular/router";
import { LandingLayout } from "../layout/landing-layout/landing-layout";
import { HomePage } from "./home-page/home-page";

export const LANDING_ROUTES: Routes =[
  {
    path: '',
    component: LandingLayout,
    children:[
      {
        path: '',
        component: HomePage
      }
    ]
  }
]
