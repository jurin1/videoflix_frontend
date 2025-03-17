import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Authentication service to manage user authentication status.
 *
 * @Injectable
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Subject to hold and emit the authentication status.
   * @private
   */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  /**
   * Observable that emits the current authentication status.
   * @public
   */
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Constructor for AuthService.
   */
  constructor() { }

  /**
   * Checks if the user is currently authenticated by verifying the presence of an 'authToken' in localStorage.
   * @returns {boolean} True if 'authToken' exists in localStorage, false otherwise.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Updates the authentication status to authenticated.
   * This method is typically called after a successful login.
   */
  loginSuccessful() {
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Logs out the user by removing 'authToken' from localStorage and updating the authentication status to not authenticated.
   */
  logout() {
    localStorage.removeItem('authToken');
    this.isAuthenticatedSubject.next(false);
  }
}