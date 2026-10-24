import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfileResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`);
  }

  public updateProfile(data: { display_name: string; student_id?: string | null }): Observable<{
    success: boolean;
    message: string;
    user: User;
  }> {
    return this.http.put<{ success: boolean; message: string; user: User }>(`${this.apiUrl}/profile`, data);
  }

  public deleteAccount(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/account`);
  }
}
