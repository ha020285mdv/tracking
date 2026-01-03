import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

/**
 * HTTP Interceptor that automatically adds Firebase ID token to all requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only add auth header for API requests
  if (!req.url.includes('cloudfunctions.net')) {
    return next(req);
  }

  // Get token and add to request
  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        // If no token, proceed without auth header
        return next(req);
      }

      // Clone request and add Authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(authReq);
    })
  );
};
