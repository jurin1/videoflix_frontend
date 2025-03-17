import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Component representing the header of the application.
 * Displays login/logout status and provides logout functionality.
 *
 * @Component
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  /**
   * Boolean indicating if the user is authenticated.
   * @public
   */
  isAuthenticated = false;
  /**
   * Subject to manage the component's lifecycle and unsubscribe from observables.
   * @private
   */
  private destroy$ = new Subject<void>();

  /**
   * @param {Router} router Angular Router service for navigation.
   * @param {AuthService} authService Authentication service to manage user authentication status.
   */
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  /**
   * Lifecycle hook called after component initialization.
   * Subscribes to the authentication status observable to update the component's isAuthenticated property.
   */
  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      });
  }

  /**
   * Lifecycle hook called when the component is destroyed.
   * Emits a complete signal to the destroy$ Subject to unsubscribe from all subscriptions and prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Logs out the user by calling the logout method from AuthService and navigates to the login page.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}