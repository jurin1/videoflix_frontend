import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Component for handling the forgot password functionality.
 * Allows users to request a password reset email.
 *
 * @Component
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {

  /**
   * FormGroup for the forgot password form, containing the email input.
   */
  forgotPasswordForm: FormGroup;

  /**
   * @param {ApiService} apiService Service for making API calls, specifically for forgot password functionality.
   * @param {ToastrService} toastr Service for displaying toast notifications to the user.
   * @param {Router} router Service for navigating to different routes.
   * @param {AuthService} authService Service for authentication related functionalities, used to check if user is already authenticated.
   */
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  /**
   * Lifecycle hook called after component is initialized.
   * Checks if the user is already authenticated and navigates to the dashboard if so.
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Handles the submission of the forgot password form.
   * Sends a request to the API to send a password reset email if the form is valid.
   * Displays success or error toast messages based on the API response.
   */
  submitForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      this.apiService.forgotPassword(email).subscribe({
        next: (response) => {
          this.toastr.success('We have sent you an email to reset your password. Please check your inbox.', 'Email sent');
        },
        error: (errorMessage) => {
          this.toastr.error('An error occurred while resetting your password. Please try again later.', 'Error');
        }
      });
    }
  }
}