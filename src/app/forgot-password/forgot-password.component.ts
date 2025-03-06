import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]) // Nur E-Mail-Feld mit Validierung
    });
  }

  submitForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      console.log('Forgot Password Form Value:', this.forgotPasswordForm.value);
    } else {
      console.log('Formular ist ungültig');
    }
  }
}