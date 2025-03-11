import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; 


export interface VideoResponse {
  id: number;
  title: string;
  description: string;
  video_file: string;
  thumbnail: string;
  resolutions: { 
    "120p"?: string; 
    "360p"?: string;
    "720p"?: string;
    "1080p"?: string;
  };
  upload_date: string;
  genre: string;
}
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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Token ${token || ''}`
    });
  }


  getVideos(): Observable<any> {
    return this.http.get<VideoResponse[]>(`${this.backendUrl}/videos/all-videos/`, { headers: this.getAuthHeaders() });
  }

  getContinueWatchingVideos(): Observable<any> {
    return this.http.get(`${this.backendUrl}/videos/viewing/continue-watching/`, { headers: this.getAuthHeaders() });
  }
  
}