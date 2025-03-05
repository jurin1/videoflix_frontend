import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private backendUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/register/`, userData);
  }

  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/login/`, credentials);
  }

  logoutUser(): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/logout/`, {});
  }

}