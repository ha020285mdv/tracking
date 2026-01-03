import { Routes } from '@angular/router';
import { HomePage } from './core/pages/home-page/home-page';
import { PageNotFound } from './core/pages/page-not-found/page-not-found';
import { WorkoutsPage } from './core/pages/workouts-page/workouts-page';
import { WorkoutPage } from './core/pages/workout-page/workout-page';
import { workoutResolver } from './core/resolvers/workout.resolver';
import { activeSessionResolver } from './core/resolvers/active-session.resolver';
import { SessionPage } from './core/pages/session-page/session-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'workouts',
    component: WorkoutsPage,
  },
  {
    path: 'workouts/:id',
    component: WorkoutPage,
    resolve: {
      workout: workoutResolver,
    },
  },
  {
    path: 'session',
    component: SessionPage,
    resolve: { session: activeSessionResolver },
  },
  {
    path: '**',
    component: PageNotFound,
  },
];
