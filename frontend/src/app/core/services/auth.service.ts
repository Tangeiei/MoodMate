import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'moodmate_auth_token';
  private readonly USER_KEY = 'moodmate_auth_user';

  // State management with Signals
  private currentUserSignal = signal<User | null>(this.getInitialUser());
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getInitialUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        if (res.success && res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  public login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(res => {
        if (res.success && res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  public logout(): void {
    // Call backend logout endpoint (optional cleanup)
    this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();

    this.clearSession();
    this.router.navigate(['/login']);
  }

  public checkAuth(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.clearSession();
      return of(false);
    }

    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/auth/me`).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.setUser(res.user);
        }
      }),
      map(res => !!res.success),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  public updateCurrentUser(user: Partial<User>): void {
    const current = this.currentUserSignal();
    if (current) {
      const updated = { ...current, ...user };
      this.setUser(updated);
    }
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.setUser(user);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  public clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }
}
