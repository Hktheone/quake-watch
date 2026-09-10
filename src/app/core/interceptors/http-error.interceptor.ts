import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { StateService } from '../../services/state-service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const stateService = inject(StateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      stateService.addAlert({
        message: `Request failed: ${new URL(req.url, window.location.origin).pathname}`,
        type: 'error',
      });
      return throwError(() => error);
    })
  );
};
