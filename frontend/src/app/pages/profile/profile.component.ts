import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfileResponse } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper profile-page">
      <div class="app-container">
        <div class="profile-layout">
          <!-- Main Profile Settings -->
          <div class="profile-main">
            <!-- User Info & Edit Card -->
            <div class="mm-card profile-card">
              <div class="profile-header">
                <div class="avatar-circle">
                  <span>{{ getInitials(profileData?.display_name || authService.currentUser()?.display_name) }}</span>
                </div>
                <div>
                  <h2>{{ profileData?.display_name || authService.currentUser()?.display_name }}</h2>
                  <p class="profile-email">{{ profileData?.email || authService.currentUser()?.email }}</p>
                </div>
              </div>

              <!-- Feedback Messages -->
              <div *ngIf="successMessage" class="alert alert-success">
                <span>✅</span>
                <span>{{ successMessage }}</span>
              </div>
              <div *ngIf="errorMessage" class="alert alert-error">
                <span>⚠️</span>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Edit Form -->
              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
                <div class="form-group">
                  <label class="form-label" for="display_name">ชื่อที่ใช้แสดงในระบบ</label>
                  <input
                    id="display_name"
                    type="text"
                    class="form-control"
                    formControlName="display_name"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="student_id">รหัสนักศึกษา</label>
                  <input
                    id="student_id"
                    type="text"
                    class="form-control"
                    formControlName="student_id"
                    placeholder="เช่น 64010123"
                  />
                </div>

                <div class="form-actions">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="profileForm.invalid || isUpdating"
                  >
                    {{ isUpdating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
                  </button>
                  <button type="button" class="btn btn-outline" (click)="authService.logout()">
                    ออกจากระบบ
                  </button>
                </div>
              </form>
            </div>

            <!-- Stats Overview Card -->
            <div class="mm-card stats-card" *ngIf="profileData">
              <h3>📈 สถิติการใช้งานของคุณ</h3>
              <div class="grid grid-2 stats-subgrid">
                <div class="stat-box">
                  <span class="stat-number">{{ profileData.stats?.total_entries || 0 }}</span>
                  <span class="stat-label">บันทึกอารมณ์ทั้งหมด (ครั้ง)</span>
                </div>
                <div class="stat-box">
                  <span class="stat-number">{{ profileData.stats?.total_activities || 0 }}</span>
                  <span class="stat-label">ทำกิจกรรม Self-care (ครั้ง)</span>
                </div>
              </div>
            </div>

            <!-- Danger Zone: Delete Account -->
            <div class="mm-card danger-card">
              <h3 class="danger-title">⚠️ พื้นที่จัดการความปลอดภัยขั้นสูง</h3>
              <p class="danger-desc">
                หากคุณต้องการยกเลิกการใช้งาน คุณสามารถลบบัญชีและข้อมูลทั้งหมดได้ การกระทำนี้ไม่สามารถย้อนคืนได้
                บันทึกอารมณ์และประวัติกิจกรรมทั้งหมดจะถูกลบถาวรจากฐานข้อมูล
              </p>
              <button class="btn btn-danger" (click)="confirmDeleteAccount()">
                🗑️ ลบบัญชีผู้ใช้และข้อมูลทั้งหมด
              </button>
            </div>
          </div>

          <!-- Privacy Policy Side Column -->
          <div class="profile-side">
            <div class="mm-card privacy-policy-card">
              <h3>🛡️ นโยบายความเป็นส่วนตัว</h3>
              <div class="policy-body">
                <h4>1. ข้อมูลที่เราจัดเก็บ</h4>
                <p>
                  จัดเก็บเฉพาะข้อมูลที่จำเป็นต่อการใช้งานระบบ ได้แก่ ชื่อแสดงผล อีเมล รหัสผ่าน (ที่ผ่านการ Hash อย่างปลอดภัย)
                  และบันทึกอารมณ์/กิจกรรมที่คุณเป็นผู้ป้อนเข้าสู่ระบบด้วยตนเอง
                </p>

                <h4>2. วัตถุประสงค์ในการใช้ข้อมูล</h4>
                <p>
                  เพื่อแสดงสถิติและแนวโน้มสุขภาพใจส่วนบุคคลของคุณเท่านั้น ไม่มีการนำข้อมูลไปขาย ส่งต่อ หรือใช้เพื่อการโฆษณาใด ๆ ทั้งสิ้น
                </p>

                <h4>3. ความเป็นส่วนตัวและความปลอดภัย</h4>
                <p>
                  ไม่มีการใช้ AI ประมวลผลหรือเทรนข้อมูล และผู้ใช้งานท่านอื่นไม่สามารถเข้าถึงบันทึกของคุณได้เด็ดขาด
                </p>

                <h4>4. สิทธิในการลบข้อมูล</h4>
                <p>
                  คุณมีสิทธิ์ลบบันทึกรายวัน หรือลบบัญชีพร้อมข้อมูลทั้งหมดออกจากฐานข้อมูลจริงได้ตลอดเวลาผ่านปุ่มลบบัญชี
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2rem;
    }

    .profile-card {
      margin-bottom: 2rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-light);
    }

    .avatar-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-header h2 {
      font-size: 1.45rem;
      margin-bottom: 0.2rem;
    }

    .profile-email {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    /* Stats Card */
    .stats-card {
      margin-bottom: 2rem;
    }

    .stats-card h3 {
      font-size: 1.15rem;
      margin-bottom: 1rem;
    }

    .stats-subgrid {
      gap: 1rem;
    }

    .stat-box {
      background: var(--bg-main);
      padding: 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      text-align: center;
    }

    .stat-number {
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--primary);
      display: block;
    }

    .stat-label {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    /* Danger Card */
    .danger-card {
      border-color: #fecdd3;
      background: #fff1f2;
    }

    .danger-title {
      font-size: 1.15rem;
      color: var(--accent-rose);
      margin-bottom: 0.4rem;
    }

    .danger-desc {
      font-size: 0.875rem;
      color: var(--text-body);
      margin-bottom: 1.25rem;
      line-height: 1.6;
    }

    /* Privacy Policy Card */
    .privacy-policy-card h3 {
      font-size: 1.2rem;
      margin-bottom: 1.25rem;
      color: var(--primary);
    }

    .policy-body h4 {
      font-size: 0.925rem;
      margin: 1rem 0 0.25rem;
      color: var(--text-main);
    }

    .policy-body p {
      font-size: 0.85rem;
      color: var(--text-body);
      line-height: 1.6;
    }

    @media (max-width: 868px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public profileData: any = null;
  public isUpdating = false;
  public successMessage: string | null = null;
  public errorMessage: string | null = null;

  public profileForm: FormGroup = this.fb.group({
    display_name: ['', [Validators.required, Validators.maxLength(100)]],
    student_id: ['']
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profileData = res.data;
          this.profileForm.patchValue({
            display_name: res.data.display_name,
            student_id: res.data.student_id || ''
          });
        }
      }
    });
  }

  public onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.isUpdating = false;
        this.successMessage = res.message;
        this.authService.updateCurrentUser({
          display_name: res.user.display_name,
          student_id: res.user.student_id
        });
      },
      error: (err) => {
        this.isUpdating = false;
        this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล';
      }
    });
  }

  public confirmDeleteAccount(): void {
    const confirmed = confirm(
      'คำเตือนร้ายแรง: คุณต้องการลบบัญชีและข้อมูลทั้งหมดใช่หรือไม่?\n\nการกระทำนี้จะลบบันทึกอารมณ์และประวัติกิจกรรมทั้งหมดของคุณออกจากฐานข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้'
    );
    if (!confirmed) return;

    this.profileService.deleteAccount().subscribe({
      next: (res) => {
        alert(res.message || 'ลบบัญชีเรียบร้อยแล้ว');
        this.authService.clearSession();
        this.router.navigate(['/']);
      },
      error: (err) => {
        alert(err.error?.message || 'เกิดข้อผิดพลาดในการลบบัญชี');
      }
    });
  }

  public getInitials(name?: string | null): string {
    if (!name) return 'M';
    return name.trim().charAt(0).toUpperCase();
  }
}
