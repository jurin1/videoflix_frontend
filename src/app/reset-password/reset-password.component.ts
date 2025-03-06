import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms'; // Import AbstractControl and ValidatorFn
import { SharedModule } from '../shared/shared.module';


function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null { // Use AbstractControl here
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

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  resetPasswordForm: FormGroup;

  constructor() {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, passwordMatchValidator as ValidatorFn); 
  }

  submitResetPassword() {
    if (this.resetPasswordForm.valid) {
      console.log('Reset Password Form Value:', this.resetPasswordForm.value);

    } else {
      console.log('Formular ist ungültig');

    }
  }
}