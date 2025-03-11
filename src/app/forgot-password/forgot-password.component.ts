import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service'; 
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  forgotPasswordForm: FormGroup;

  constructor(
    private apiService: ApiService, 
    private toastr: ToastrService 
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  submitForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      this.apiService.forgotPassword(email).subscribe({ 
        next: (response) => {
          console.log('Passwort-Reset E-Mail gesendet:', response);
          this.toastr.success('Wir haben dir eine E-Mail zum Zurücksetzen deines Passworts geschickt. Bitte prüfe deinen Posteingang.', 'E-Mail gesendet'); // Erfolgs-Toast
        },
        error: (errorMessage) => {
          console.error('Fehler beim Senden der Passwort-Reset E-Mail:', errorMessage);
          this.toastr.error('Beim Zurücksetzen deines Passworts ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.', 'Fehler'); // Fehler-Toast (generische Meldung)
        }
      });
    } else {
      console.log('Formular ist ungültig');
    }
  }
}