import { Routes } from '@angular/router';
import { HomePage } from './core/pages/home-page/home-page';
import { PageNotFound } from './core/pages/page-not-found/page-not-found';
import { WorkoutsPage } from './core/pages/workouts-page/workouts-page';
import { WorkoutPage } from './core/pages/workout-page/workout-page';
import { LoginPage } from './core/pages/login-page/login-page';
import { workoutResolver } from './core/resolvers/workout.resolver';
import { activeSessionResolver } from './core/resolvers/active-session.resolver';
import { SessionPage } from './core/pages/session-page/session-page';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [publicGuard],
  },
  {
    path: '',
    component: HomePage,
    canActivate: [authGuard],
  },
  {
    path: 'workouts',
    component: WorkoutsPage,
    canActivate: [authGuard],
  },
  {
    path: 'workouts/:id',
    component: WorkoutPage,
    canActivate: [authGuard],
    resolve: {
      workout: workoutResolver,
    },
  },
  {
    path: 'session',
    component: SessionPage,
    canActivate: [authGuard],
    resolve: { session: activeSessionResolver },
  },
  {
    path: '**',
    component: PageNotFound,
  },
];
