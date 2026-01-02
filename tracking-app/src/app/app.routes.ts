import { Routes } from '@angular/router';
import { ActiveWorkout } from './core/pages/active-workout/active-workout';
import { LandingPage } from './core/pages/landing-page/landing-page';
import { PageNotFound } from './core/pages/page-not-found/page-not-found';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'active',
    component: ActiveWorkout,
  },
  {
    path: '**',
    component: PageNotFound,
  },
];
