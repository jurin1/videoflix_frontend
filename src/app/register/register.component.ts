import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { Subject, takeUntil, debounceTime, filter } from 'rxjs';


function emailDomainValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(control.value);
    return valid ? null : { 'emailDomain': true }; 
  };
}


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

  constructor() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, emailDomainValidator()]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, passwordMatchValidator as ValidatorFn);
  }

  ngOnInit(): void {
    this.setupRealTimeValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRealTimeValidation() {
    ['email', 'password', 'confirmPassword'].forEach(controlName => {
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

  submitRegister() {
    if (this.registerForm.valid) {
      console.log('Register Form Value:', this.registerForm.value);
    } else {
      console.log('Formular ist ungültig');
    }
  }
}