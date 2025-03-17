import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Service to protect routes and ensure user authentication.
 *
 * @Injectable
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /**
   * @param {AuthService} authService Authentication service to check if user is authenticated.
   * @param {Router} router Angular Router service for navigation.
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Checks if the user is authenticated to access the requested route.
   * If authenticated, allows access; otherwise, redirects to the login page.
   *
   * @param {ActivatedRouteSnapshot} route The activated route snapshot.
   * @param {RouterStateSnapshot} state The router state snapshot.
   * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree} True if authenticated, UrlTree to login page otherwise.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticated()) {
      return true; // Allow access if authenticated
    } else {
      // Redirect to login page if not authenticated
      return this.router.parseUrl('/login');
    }
  }

}