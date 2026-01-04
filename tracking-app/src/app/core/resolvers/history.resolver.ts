import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { WorkoutHistory } from '../models/workout-history.model';

export const historyResolver: ResolveFn<WorkoutHistory[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<WorkoutHistory[]> => {
  // TODO: implement
  return of([]);
};
