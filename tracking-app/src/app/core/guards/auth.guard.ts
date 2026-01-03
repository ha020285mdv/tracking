import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, filter, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // wait for auth to finish loading, then check authentication
  return toObservable(authService.isLoading).pipe(
    filter((isLoading) => !isLoading), // wait until loading is complete
    take(1), 
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }

      // redirect to attempted URL after login
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    })
  );
};


//redirects authenticated users away from login/signup pages
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // wait for auth to finish loading, then check authentication
  return toObservable(authService.isLoading).pipe(
    filter((isLoading) => !isLoading), // wait until loading is complete
    take(1), 
    map(() => {
      if (!authService.isAuthenticated()) {
        return true;
      }

      // Redirect authenticated users to home
      router.navigate(['/']);
      return false;
    })
  );
};
