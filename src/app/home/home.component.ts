import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Home component that redirects authenticated users to the dashboard.
 *
 * @Component
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  /**
   * @param {Router} router Angular Router service for navigation.
   * @param {AuthService} authService Authentication service to check user authentication status.
   */
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  /**
   * Lifecycle hook called after component initialization.
   * Checks if the user is authenticated and navigates to the dashboard if authenticated.
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}