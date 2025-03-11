import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  backendError: string | null = null;

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

  submitLogin() {
    if (this.loginForm.valid) {

      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.apiService.loginUser(loginData).subscribe({
        next: (response) => {
          console.log('Login erfolgreich:', response);
          localStorage.setItem('authToken', response.token);
          this.authService.loginSuccessful();
          this.router.navigate(['/dashboard']);
          this.toastr.success('Login erfolgreich!', 'Erfolg'); 
        },
        error: (errorMessage) => {
          console.error('Login fehlgeschlagen:', errorMessage);
          this.toastr.error(errorMessage, 'Login Fehler'); 
        }
      });
    } else {
      console.log('Formular ist ungültig');
    }
  }
}
