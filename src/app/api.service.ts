import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 

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
    return this.http.post(`${this.backendUrl}/users/login/`, credentials).pipe( 
      catchError(this.handleError) 
    );
  }

  logoutUser(): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/logout/`, {});
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Etwas ist schiefgelaufen; bitte versuche es später noch einmal.'; 

    if (error.error instanceof ErrorEvent) {

      console.error('Ein Fehler ist aufgetreten:', error.error.message);
      errorMessage = `Fehler: ${error.error.message}`; 
    } else {

      console.error(
        `Backend Fehlercode: ${error.status}, ` +
        `Nachricht: ${error.error}`); 

      if (error.status === 401) { 
        errorMessage = 'Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort.'; 
      } else {
        errorMessage = `Backend Fehler: ${error.status}, ${error.error}`; 
      }
    }
    return throwError(() => errorMessage); 
  }
}