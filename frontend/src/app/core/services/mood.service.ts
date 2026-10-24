import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoodEntry, MoodFactor, CreateMoodRequest, MoodListResponse, MoodDetailResponse } from '../models/mood.model';

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private readonly apiUrl = `${environment.apiUrl}/moods`;

  constructor(private http: HttpClient) {}

  public getFactors(): Observable<{ success: boolean; data: MoodFactor[] }> {
    return this.http.get<{ success: boolean; data: MoodFactor[] }>(`${this.apiUrl}/factors`);
  }

  public getMoods(filters?: {
    start_date?: string;
    end_date?: string;
    mood_score?: number | string;
    factor_id?: number | string;
    page?: number;
    limit?: number;
  }): Observable<MoodListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
      if (filters.mood_score) params = params.set('mood_score', filters.mood_score.toString());
      if (filters.factor_id) params = params.set('factor_id', filters.factor_id.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<MoodListResponse>(this.apiUrl, { params });
  }

  public getMoodById(id: number): Observable<MoodDetailResponse> {
    return this.http.get<MoodDetailResponse>(`${this.apiUrl}/${id}`);
  }

  public createMood(data: CreateMoodRequest): Observable<{ success: boolean; message: string; id?: number }> {
    return this.http.post<{ success: boolean; message: string; id?: number }>(this.apiUrl, data);
  }

  public updateMood(id: number, data: CreateMoodRequest): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  public deleteMood(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
