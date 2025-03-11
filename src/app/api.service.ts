import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 

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

  resetPassword(resetData: any, uuid:any, token:any): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/password/reset/confirm/${uuid}/${token}/`, resetData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/password/reset/`, { email });
  }
  
}