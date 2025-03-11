import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated()); 
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); 

  constructor() { }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  loginSuccessful() {
    this.isAuthenticatedSubject.next(true);
  }

  logout() {
    localStorage.removeItem('authToken');
    this.isAuthenticatedSubject.next(false);
  }
}