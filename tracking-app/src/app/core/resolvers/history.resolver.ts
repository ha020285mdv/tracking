import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { WorkoutHistory } from '../models/workout-history.model';

export const historyResolver: ResolveFn<WorkoutHistory[]> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<WorkoutHistory[]> => {
  // TODO: implement
  return of([]);
};
