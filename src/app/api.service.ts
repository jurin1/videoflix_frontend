import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Interface for the video response object.
 */
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

/**
 * ApiService is responsible for making HTTP requests to the backend API.
 * It handles user registration, login, password reset, and fetching video data.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private backendUrl = 'http://localhost:8000/api';

  /**
   * Constructor for ApiService.
   * @param http - HttpClient service for making HTTP requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * Registers a new user.
   * @param userData - User registration data.
   * @returns An Observable that emits the response from the registration API call.
   */
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/register/`, userData);
  }

  /**
   * Logs in an existing user.
   * @param credentials - User login credentials.
   * @returns An Observable that emits the response from the login API call.
   */
  loginUser(credentials: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/login/`, credentials);
  }

  /**
   * Resets user password after confirmation.
   * @param resetData - New password and confirmation data.
   * @param uuid - User UUID for password reset.
   * @param token - Password reset token.
   * @returns An Observable that emits the response from the reset password confirmation API call.
   */
  resetPassword(resetData: any, uuid: any, token: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/password/reset/confirm/${uuid}/${token}/`, resetData);
  }

  /**
   * Sends a forgot password request to the backend.
   * @param email - User email for password reset request.
   * @returns An Observable that emits the response from the forgot password API call.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/users/password/reset/`, { email });
  }

  /**
   * Retrieves authentication headers with the JWT token from localStorage.
   * @private
   * @returns HttpHeaders object containing the Authorization header with the JWT token.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Token ${token || ''}`
    });
  }

  /**
   * Fetches all videos from the backend.
   * @returns An Observable that emits an array of VideoResponse objects.
   */
  getVideos(): Observable<any> {
    return this.http.get<VideoResponse[]>(`${this.backendUrl}/videos/all-videos/`, { headers: this.getAuthHeaders() });
  }

  /**
   * Fetches videos that are marked as 'continue watching' for the authenticated user.
   * @returns An Observable that emits the response containing 'continue watching' videos.
   */
  getContinueWatchingVideos(): Observable<any> {
    return this.http.get(`${this.backendUrl}/videos/viewing/continue-watching/`, { headers: this.getAuthHeaders() });
  }
}