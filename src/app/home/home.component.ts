import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  emailForm: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {
    this.emailForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
  }

  submitEmailRequest() {
    if (this.emailForm.valid) {
      const email = this.emailForm.value.email;

      this.apiService.accountActionRequest(email).subscribe({
        next: (response) => {
          this.toastr.success('Check your email inbox for further instructions.', 'Email sent!');
        },
        error: (error) => {
          if (error.status === 404) {
            const registerUrl = error.error.register_url;
            if (registerUrl) {
              const emailParam = new URL(registerUrl).searchParams.get('email');
              this.router.navigate(['/register'], { queryParams: { email: emailParam } });
            } else {
              this.toastr.error(error.error.message || 'Email address not found.', 'Error');
            }
          } else {
            this.toastr.error('An unexpected error occurred. Please try again later.', 'Error');
          }
        }
      });
    }
  }
}