import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper auth-page">
      <div class="app-container">
        <div class="auth-card-wrapper">
          <div class="mm-card auth-card">
            <div class="auth-header">
              <span class="auth-icon">🌱</span>
              <h2>สมัครสมาชิก MoodMate</h2>
              <p>เริ่มต้นสร้างพื้นที่ปลอดภัยเพื่อติดตามและดูแลใจของคุณ</p>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="alert alert-error">
              <span>⚠️</span>
              <span>{{ errorMessage }}</span>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <!-- Display Name -->
              <div class="form-group">
                <label class="form-label" for="display_name">ชื่อที่ใช้แสดงในระบบ <span class="required">*</span></label>
                <input
                  id="display_name"
                  type="text"
                  class="form-control"
                  formControlName="display_name"
                  placeholder="เช่น ตะวัน, น้องฟ้า, Nickname"
                  [class.is-invalid]="f['display_name'].touched && f['display_name'].invalid"
                />
                <div *ngIf="f['display_name'].touched && f['display_name'].invalid" class="form-feedback-error">
                  <span *ngIf="f['display_name'].errors?.['required']">กรุณากรอกชื่อที่ใช้แสดง</span>
                  <span *ngIf="f['display_name'].errors?.['maxlength']">ชื่อต้องไม่เกิน 100 ตัวอักษร</span>
                </div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label" for="email">อีเมล <span class="required">*</span></label>
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

              <!-- Student ID (Optional) -->
              <div class="form-group">
                <label class="form-label" for="student_id">รหัสนักศึกษา <span class="optional">(ไม่บังคับ)</span></label>
                <input
                  id="student_id"
                  type="text"
                  class="form-control"
                  formControlName="student_id"
                  placeholder="เช่น 64010123"
                />
              </div>

              <!-- Password -->
              <div class="form-group">
                <label class="form-label" for="password">รหัสผ่าน <span class="required">*</span></label>
                <input
                  id="password"
                  type="password"
                  class="form-control"
                  formControlName="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  [class.is-invalid]="f['password'].touched && f['password'].invalid"
                />
                <div *ngIf="f['password'].touched && f['password'].invalid" class="form-feedback-error">
                  <span *ngIf="f['password'].errors?.['required']">กรุณากำหนดรหัสผ่าน</span>
                  <span *ngIf="f['password'].errors?.['minlength']">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</span>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="form-group">
                <label class="form-label" for="confirm_password">ยืนยันรหัสผ่าน <span class="required">*</span></label>
                <input
                  id="confirm_password"
                  type="password"
                  class="form-control"
                  formControlName="confirm_password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  [class.is-invalid]="f['confirm_password'].touched && (f['confirm_password'].invalid || registerForm.errors?.['passwordMismatch'])"
                />
                <div *ngIf="f['confirm_password'].touched && (f['confirm_password'].invalid || registerForm.errors?.['passwordMismatch'])" class="form-feedback-error">
                  <span *ngIf="f['confirm_password'].errors?.['required']">กรุณายืนยันรหัสผ่าน</span>
                  <span *ngIf="registerForm.errors?.['passwordMismatch']">รหัสผ่านทั้งสองช่องไม่ตรงกัน</span>
                </div>
              </div>

              <!-- Privacy Policy Agreement -->
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="privacy_accepted" />
                  <span>
                    ฉันได้อ่านและยอมรับ 
                    <a routerLink="/profile" target="_blank">นโยบายความเป็นส่วนตัว</a>
                    และยินยอมให้จัดเก็บข้อมูลเพื่อการใช้งานในระบบ MoodMate
                  </span>
                </label>
                <div *ngIf="f['privacy_accepted'].touched && f['privacy_accepted'].invalid" class="form-feedback-error">
                  กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-block"
                [disabled]="registerForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-small"></span>
                <span *ngIf="!isLoading">สร้างบัญชีผู้ใช้</span>
              </button>
            </form>

            <div class="auth-footer">
              <p>มีบัญชีผู้ใช้อยู่แล้ว? <a routerLink="/login">เข้าสู่ระบบที่นี่</a></p>
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
      max-width: 480px;
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

    .required {
      color: var(--accent-rose);
    }

    .optional {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .checkbox-group {
      margin: 1.25rem 0 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.875rem;
      color: var(--text-body);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      margin-top: 0.2rem;
      accent-color: var(--primary);
    }

    .btn-block {
      width: 100%;
      padding: 0.8rem;
      font-size: 1rem;
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public isLoading = false;
  public errorMessage: string | null = null;

  public registerForm: FormGroup = this.fb.group({
    display_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    student_id: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required]],
    privacy_accepted: [false, [Validators.requiredTrue]]
  }, { validators: this.passwordMatchValidator });

  get f() {
    return this.registerForm.controls;
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirm_password')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  public onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง';
      }
    });
  }
}
