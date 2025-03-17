import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Validator function to check if the password and confirmPassword fields match.
 * @param control - The abstract control (FormGroup) to validate.
 * @returns A validation function that returns null if passwords match, otherwise an error object.
 */
function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const formGroup = control as FormGroup;
  if (!formGroup) {
    return null;
  }

  const password = formGroup.get('newPassword')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null;
  } else {
    return { passwordMismatch: true };
  }
}

/**
 * Component for resetting user password.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  userId: string | null = null;
  resetToken: string | null = null;

  /**
   * Constructor for the ResetPasswordComponent.
   * @param route - ActivatedRoute service to access route parameters.
   * @param apiService - ApiService service to handle API calls.
   * @param toastr - ToastrService service to display toast notifications.
   * @param router - Router service for navigation.
   */
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, passwordMatchValidator as ValidatorFn);
  }

  /**
   * Lifecycle hook called after component initialization.
   * Retrieves userId and reset token from the route parameters.
   */
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.resetToken = this.route.snapshot.paramMap.get('token');
  }

  /**
   * Submits the reset password form.
   * Validates the form and sends a request to the API to reset the password.
   * Displays success or error messages using toastr and navigates to login on success.
   */
  submitResetPassword() {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.value.newPassword;
      const confirmPassword = this.resetPasswordForm.value.confirmPassword;

      if (this.userId && this.resetToken) {
        const resetData = {
          new_password: newPassword,
          confirm_password: confirmPassword,
        };
        const uuid = this.userId;
        const token = this.resetToken

        this.apiService.resetPassword(resetData, uuid, token).subscribe({
          next: (response) => {
            this.toastr.success('Your password has been reset successfully. You can now log in with your new password.', 'Password Reset Successful');
            this.router.navigate(['/login']);
          },
          error: (errorMessage) => {
            this.toastr.error('An error occurred while resetting your password. Please try again later or request a new link.', 'Password Reset Error');
          }
        });
      } else {
        this.toastr.error('Invalid password reset link. Please request a new link.', 'Invalid Link');
      }
    }
  }
}