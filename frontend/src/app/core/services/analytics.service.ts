import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoodAnalyticsResponse } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  public getMoodAnalytics(period: '7d' | '30d' = '7d'): Observable<MoodAnalyticsResponse> {
    const params = new HttpParams().set('period', period);
    return this.http.get<MoodAnalyticsResponse>(`${this.apiUrl}/moods`, { params });
  }
}
