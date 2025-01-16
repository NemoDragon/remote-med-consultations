import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

import { map, switchMap, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean> | Promise<boolean> {
    const requiredRole = route.data['role'];
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (user) {
          return this.authService.getUserRole(user.uid).then((role) => {
            if (role === requiredRole) {
              return true;
            } else {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          });
        } else {
          this.router.navigate(['/login']);
          return Promise.resolve(false);
        }
      })
    );
  }
}
