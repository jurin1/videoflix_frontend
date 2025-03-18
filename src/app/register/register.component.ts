import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { Subject, takeUntil, debounceTime, filter } from 'rxjs';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Validator function to check if the email domain is valid.
 * @returns A validation function that returns null if the email is valid, otherwise an error object.
 */
function emailDomainValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(control.value);
    return valid ? null : { 'emailDomain': true };
  };
}

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

  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;

  if (password === confirmPassword) {
    return null;
  } else {
    return { passwordMismatch: true };
  }
}

/**
 * Component for user registration.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {

  registerForm: FormGroup;
  private destroy$ = new Subject<void>();

  /**
   * Constructor for the RegisterComponent.
   * @param apiService - Service for making API calls.
   * @param toastr - Service for displaying toast notifications.
   * @param router - Service for navigation.
   * @param authService - Service for authentication.
   */
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, emailDomainValidator()]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, passwordMatchValidator as ValidatorFn);
  }

  /**
   * Lifecycle hook called after component initialization.
   * Checks if the user is already authenticated and navigates to the dashboard if so.
   * Sets up real-time validation for form controls.
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.setupRealTimeValidation();

    this.route.queryParams.subscribe(params => {
      const emailFromQuery = params['email'];
      if (emailFromQuery) {
        this.registerForm.patchValue({ email: emailFromQuery });
      }
    });
  }

  /**
   * Lifecycle hook called before the component is destroyed.
   * Emits a complete signal to the destroy$ Subject to unsubscribe from observables.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up real-time validation for specific form controls.
   * Validation is triggered after a debounce time of 5000ms and only if the control value length is at least 3.
   */
  private setupRealTimeValidation() {
    ['username', 'email', 'password', 'confirmPassword'].forEach(controlName => {
      const control = this.registerForm.get(controlName);
      if (control) {
        control.valueChanges.pipe(
          takeUntil(this.destroy$),
          filter(value => value.length >= 3),
          debounceTime(5000)
        ).subscribe(() => {
          control.updateValueAndValidity({ emitEvent: false });
        });
      }
    });
  }

  /**
   * Submits the registration form.
   * If the form is valid, it calls the apiService to register the user and handles success or error responses.
   */
  submitRegister() {
    if (this.registerForm.valid) {
      const registerData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      };

      this.apiService.registerUser(registerData).subscribe({
        next: (response) => {
          this.toastr.success('Registration successful! Please check your emails to activate your account.', 'Success');
        },
        error: (error) => {
          this.toastr.error(error.error.error, 'Registration Error');
        }
      });
    }
  }
}