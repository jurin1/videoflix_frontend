import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
import { OnInit } from '@angular/core';

/**
 * Component for user login functionality.
 * Handles login form, submission, and authentication token storage.
 *
 * @Component
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  /**
   * FormGroup for the login form, including email and password controls.
   */
  loginForm: FormGroup;
  /**
   * Error message from the backend, if any login error occurs.
   */
  backendError: string | null = null;

  /**
   * @param {ApiService} apiService Service for making API calls, specifically for user login.
   * @param {Router} router Service for navigating to different routes after successful login.
   * @param {ToastrService} toastr Service for displaying toast notifications for login status.
   * @param {AuthService} authService Service for managing authentication state, like setting user as authenticated.
   */
  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  /**
   * Lifecycle hook called after component initialization.
   * Checks if the user is already authenticated and navigates to the dashboard if so.
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Handles the submission of the login form.
   * Sends login data to the API, stores the authentication token on successful login,
   * navigates to the dashboard, and displays toast messages for success or error.
   */
  submitLogin() {
    if (this.loginForm.valid) {

      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.apiService.loginUser(loginData).subscribe({
        next: (response) => {
          localStorage.setItem('authToken', response.token);
          this.authService.loginSuccessful();
          this.router.navigate(['/dashboard']);
          this.toastr.success('Login successful!', 'Success');
        },
        error: (errorMessage) => {
          this.toastr.error(errorMessage, 'Login Error');
        }
      });
    }
  }
}