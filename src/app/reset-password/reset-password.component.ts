import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router'; 
import { ApiService } from '../api.service'; 
import { ToastrService } from 'ngx-toastr'; 


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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService, // ApiService injecten
    private toastr: ToastrService, // ToastrService injecten
    private router: Router // Router injecten
  ) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, passwordMatchValidator as ValidatorFn);
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.resetToken = this.route.snapshot.paramMap.get('token');

    console.log('UserID aus URL:', this.userId);
    console.log('Token aus URL:', this.resetToken);
  }


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
            console.log('Passwort erfolgreich zurückgesetzt:', response);
            this.toastr.success('Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt mit deinem neuen Passwort anmelden.', 'Passwort zurückgesetzt'); // Erfolgs-Toast
            this.router.navigate(['/login']);
          },
          error: (errorMessage) => {
            console.error('Fehler beim Zurücksetzen des Passworts:', errorMessage);
            this.toastr.error('Beim Zurücksetzen deines Passworts ist ein Fehler aufgetreten. Bitte versuche es später noch einmal oder fordere einen neuen Link an.', 'Fehler beim Zurücksetzen'); // Fehler-Toast (etwas spezifischer)
          }
        });
      } else {
        console.error('UserID oder Token fehlen. URL ungültig.'); // Fallback, falls userId oder token fehlen (eigentlich sollte das nicht passieren, wenn die Route korrekt ist)
        this.toastr.error('Ungültiger Link zum Zurücksetzen des Passworts. Bitte fordere einen neuen Link an.', 'Ungültiger Link');
      }


    } else {
      console.log('Formular ist ungültig');
    }
  }
}