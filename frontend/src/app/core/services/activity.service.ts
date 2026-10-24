import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityListResponse, ActivityHistoryResponse } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private readonly apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  public getActivities(): Observable<ActivityListResponse> {
    return this.http.get<ActivityListResponse>(this.apiUrl);
  }

  public completeActivity(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/complete`, {});
  }

  public getActivityHistory(): Observable<ActivityHistoryResponse> {
    return this.http.get<ActivityHistoryResponse>(`${this.apiUrl}/history`);
  }
}
