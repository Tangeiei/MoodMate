import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper auth-page">
      <div class="app-container">
        <div class="auth-card-wrapper">
          <div class="mm-card auth-card">
            <div class="auth-header">
              <span class="auth-icon">👋</span>
              <h2>ยินดีต้อนรับกลับมา</h2>
              <p>เข้าสู่ระบบเพื่อสำรวจและดูแลสุขภาพใจของคุณต่อ</p>
            </div>

            <!-- Session Expired Alert -->
            <div *ngIf="sessionExpired" class="alert alert-info">
              <span>ℹ️</span>
              <span>เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัย</span>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="alert alert-error">
              <span>⚠️</span>
              <span>{{ errorMessage }}</span>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <!-- Email -->
              <div class="form-group">
                <label class="form-label" for="email">อีเมล</label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  formControlName="email"
                  placeholder="student@university.ac.th หรือ email@example.com"
                  [class.is-invalid]="f['email'].touched && f['email'].invalid"
                />
                <div *ngIf="f['email'].touched && f['email'].invalid" class="form-feedback-error">
                  <span *ngIf="f['email'].errors?.['required']">กรุณากรอกอีเมล</span>
                  <span *ngIf="f['email'].errors?.['email']">รูปแบบอีเมลไม่ถูกต้อง</span>
                </div>
              </div>

              <!-- Password -->
              <div class="form-group">
                <label class="form-label" for="password">รหัสผ่าน</label>
                <input
                  id="password"
                  type="password"
                  class="form-control"
                  formControlName="password"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  [class.is-invalid]="f['password'].touched && f['password'].invalid"
                />
                <div *ngIf="f['password'].touched && f['password'].invalid" class="form-feedback-error">
                  <span *ngIf="f['password'].errors?.['required']">กรุณากรอกรหัสผ่าน</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-block"
                [disabled]="loginForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-small"></span>
                <span *ngIf="!isLoading">เข้าสู่ระบบ</span>
              </button>
            </form>

            <div class="auth-footer">
              <p>ยังไม่มีบัญชี MoodMate? <a routerLink="/register">สมัครสมาชิกฟรีที่นี่</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-card-wrapper {
      max-width: 440px;
      margin: 0 auto;
    }

    .auth-card {
      padding: 2.25rem;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .auth-icon {
      font-size: 2.25rem;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .auth-header h2 {
      font-size: 1.6rem;
      margin-bottom: 0.35rem;
    }

    .auth-header p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .btn-block {
      width: 100%;
      padding: 0.8rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-light);
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .spinner-small {
      display: inline-block;
      width: 1.1rem;
      height: 1.1rem;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isLoading = false;
  public errorMessage: string | null = null;
  public sessionExpired = false;
  private returnUrl: string = '/dashboard';

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['sessionExpired']) {
      this.sessionExpired = true;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      }
    });
  }
}
