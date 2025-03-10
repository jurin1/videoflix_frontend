import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../api.service';
import { HttpClientModule } from '@angular/common/http'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {

  loginForm: FormGroup;
  backendError: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  submitLogin() {
    if (this.loginForm.valid) {
      this.backendError = null;

      
      const loginData = {
        username: this.loginForm.value.email, 
        password: this.loginForm.value.password
      };

      this.apiService.loginUser(loginData).subscribe({
        next: (response) => {
          console.log('Login erfolgreich:', response);
          localStorage.setItem('authToken', response.token);
          this.router.navigate(['/dashboard']);
        },
        error: (errorMessage) => {
          console.error('Login fehlgeschlagen:', errorMessage);
          this.backendError = errorMessage;
        }
      });
    } else {
      console.log('Formular ist ungültig');
      this.backendError = null;
    }
  }
}