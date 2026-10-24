import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../core/services/activity.service';
import { SelfCareActivity, ActivityHistoryItem } from '../../core/models/activity.model';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper activities-page">
      <div class="app-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1>🧘‍♀️ กิจกรรมดูแลใจและฟื้นฟูพลัง (Self-care)</h1>
            <p>การดูแลตัวเองไม่ใช่เรื่องเห็นแก่ตัว แต่คือการชาร์จแบตเตอรี่ให้ใจพร้อมก้าวต่อ</p>
          </div>
        </div>

        <!-- Success Feedback Banner -->
        <div *ngIf="successMsg" class="alert alert-success">
          <span>🎉</span>
          <span>{{ successMsg }}</span>
        </div>

        <!-- Interactive Breathing Exercise Widget -->
        <div class="mm-card breathing-card">
          <div class="breathing-content">
            <div class="breathing-badge">🌟 กิจกรรมแนะนำด่วน</div>
            <h2>ฝึกหายใจแบบ 4-7-8 ชะลอความตื่นตระหนก</h2>
            <p>
              เทคนิคหายใจช้าที่ได้รับการยอมรับระดับสากล ช่วยลดอัตราการเต้นของหัวใจและความตึงเครียดได้ในเวลาไม่กี่นาที
            </p>

            <div class="breathing-circle-wrapper">
              <div
                class="breathing-circle"
                [class.expand]="breathPhase === 'inhale'"
                [class.hold]="breathPhase === 'hold'"
                [class.shrink]="breathPhase === 'exhale'"
              >
                <div class="breath-text">
                  <span class="phase-title">{{ breathPhaseText }}</span>
                  <span class="countdown-num" *ngIf="isBreathing">{{ breathCountdown }}</span>
                </div>
              </div>
            </div>

            <div class="breathing-controls">
              <button
                class="btn btn-primary"
                (click)="toggleBreathing()"
              >
                {{ isBreathing ? 'หยุดฝึกหายใจ' : 'เริ่มฝึกหายใจ (4-7-8)' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Activities List Section -->
        <div class="section-title">
          <h2>เลือกทำกิจกรรมดูแลใจประจำวัน</h2>
          <p>ทำเครื่องหมายเมื่อทำสำเร็จเพื่อสะสมความสุขเล็ก ๆ ของคุณ</p>
        </div>

        <div class="grid grid-2 activities-grid">
          <div *ngFor="let act of activities" class="mm-card activity-card" [class.completed]="act.completed_today">
            <div class="activity-top">
              <span class="category-tag">{{ act.category }}</span>
              <span *ngIf="act.completed_today" class="done-tag">✓ ทำแล้ววันนี้</span>
            </div>

            <h3 class="activity-title">{{ act.title }}</h3>
            <p class="activity-desc">{{ act.description }}</p>

            <div class="activity-action">
              <button
                class="btn btn-sm"
                [ngClass]="act.completed_today ? 'btn-outline' : 'btn-primary'"
                [disabled]="isCompletingId === act.id"
                (click)="markCompleted(act)"
              >
                <span *ngIf="isCompletingId === act.id">กำลังบันทึก...</span>
                <span *ngIf="isCompletingId !== act.id">
                  {{ act.completed_today ? 'ทำซ้ำอีกครั้ง 👍' : '✓ ฉันทำกิจกรรมนี้แล้ว' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- History of Completed Activities -->
        <div class="mm-card history-card">
          <h3>📜 ประวัติการดูแลใจของคุณ</h3>
          <p class="history-desc">บันทึกกิจกรรมที่คุณได้ทำเพื่อตัวเองที่ผ่านมา</p>

          <div *ngIf="history.length > 0; else noHistory" class="history-list">
            <div *ngFor="let item of history" class="history-item">
              <div class="history-icon">✨</div>
              <div class="history-detail">
                <span class="history-title">{{ item.title }}</span>
                <span class="history-category">({{ item.category }})</span>
              </div>
              <div class="history-time">{{ formatTime(item.completed_at) }}</div>
            </div>
          </div>

          <ng-template #noHistory>
            <div class="empty-state">
              <div class="empty-state-icon">🌱</div>
              <p>ยังไม่มีประวัติการทำกิจกรรม ลองเลือกทำกิจกรรมด้านบนสัก 1 กิจกรรมนะ!</p>
            </div>
          </ng-template>
        </div>

        <!-- Medical Disclaimer -->
        <div class="disclaimer-note">
          <span>ℹ️</span>
          <span>
            คำเตือน: กิจกรรมดูแลใจเหล่านี้เป็นการผ่อนคลายและดูแลสุขภาพใจเบื้องต้น ไม่ใช่การรักษาทางการแพทย์
            หากมีภาวะซึมเศร้า วิตกกังวลรุนแรง หรือต้องการคำปรึกษา ควรเข้ารับการดูแลจากผู้เชี่ยวชาญด้านสุขภาพจิต
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.85rem;
      margin-bottom: 0.35rem;
    }

    .page-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* Breathing Card */
    .breathing-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      padding: 2.5rem 2rem;
      text-align: center;
      margin-bottom: 3rem;
    }

    .breathing-badge {
      display: inline-block;
      background: #ffffff;
      color: var(--secondary);
      border-radius: var(--radius-full);
      padding: 0.25rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .breathing-content h2 {
      font-size: 1.6rem;
      margin-bottom: 0.5rem;
    }

    .breathing-content p {
      max-width: 600px;
      margin: 0 auto 2rem;
      color: var(--text-body);
      font-size: 0.95rem;
    }

    .breathing-circle-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2rem;
      min-height: 200px;
    }

    .breathing-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.15);
      border: 3px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 4s ease-in-out;
      transform: scale(1);
    }

    .breathing-circle.expand {
      transform: scale(1.45);
      background: rgba(99, 102, 241, 0.25);
      transition: all 4s ease-out;
    }

    .breathing-circle.hold {
      transform: scale(1.45);
      background: rgba(139, 92, 246, 0.3);
      border-color: var(--accent-purple);
      transition: all 7s linear;
    }

    .breathing-circle.shrink {
      transform: scale(1);
      background: rgba(14, 165, 233, 0.2);
      border-color: var(--secondary);
      transition: all 8s ease-in-out;
    }

    .breath-text {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .phase-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .countdown-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
    }

    /* Activities Section */
    .section-title {
      margin-bottom: 1.5rem;
    }

    .section-title h2 {
      font-size: 1.45rem;
      margin-bottom: 0.25rem;
    }

    .section-title p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .activities-grid {
      margin-bottom: 3rem;
    }

    .activity-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-left: 4px solid var(--primary);
      transition: all 0.2s ease;
    }

    .activity-card.completed {
      border-left-color: var(--accent-mint);
      background: #fdfdfd;
    }

    .activity-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .category-tag {
      font-size: 0.775rem;
      background: #f1f5f9;
      color: var(--text-muted);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .done-tag {
      font-size: 0.8rem;
      color: #059669;
      font-weight: 600;
      background: #ecfdf5;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .activity-title {
      font-size: 1.15rem;
      margin-bottom: 0.5rem;
    }

    .activity-desc {
      font-size: 0.9rem;
      color: var(--text-body);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    /* History Card */
    .history-card {
      margin-bottom: 2rem;
      padding: 1.75rem;
    }

    .history-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }

    .history-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.85rem;
      background: var(--bg-main);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
    }

    .history-detail {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .history-title {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .history-category {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .history-time {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .disclaimer-note {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
  `]
})
export class ActivitiesComponent implements OnInit {
  private activityService = inject(ActivityService);

  public activities: SelfCareActivity[] = [];
  public history: ActivityHistoryItem[] = [];
  public isCompletingId: number | null = null;
  public successMsg: string | null = null;

  // Breathing Exercise State
  public isBreathing = false;
  public breathPhase: 'inhale' | 'hold' | 'exhale' | 'ready' = 'ready';
  public breathPhaseText = 'กดปุ่มเพื่อเริ่ม';
  public breathCountdown = 4;
  private breathTimer: any = null;

  ngOnInit(): void {
    this.loadActivities();
    this.loadHistory();
  }

  private loadActivities(): void {
    this.activityService.getActivities().subscribe({
      next: (res) => {
        if (res.success) {
          this.activities = res.data;
        }
      }
    });
  }

  private loadHistory(): void {
    this.activityService.getActivityHistory().subscribe({
      next: (res) => {
        if (res.success) {
          this.history = res.data;
        }
      }
    });
  }

  public markCompleted(activity: SelfCareActivity): void {
    this.isCompletingId = activity.id;
    this.successMsg = null;

    this.activityService.completeActivity(activity.id).subscribe({
      next: (res) => {
        this.isCompletingId = null;
        activity.completed_today = true;
        this.successMsg = res.message;
        this.loadHistory();
      },
      error: () => {
        this.isCompletingId = null;
        alert('เกิดข้อผิดพลาดในการบันทึกกิจกรรม');
      }
    });
  }

  // Interactive 4-7-8 Breathing Loop
  public toggleBreathing(): void {
    if (this.isBreathing) {
      this.stopBreathing();
    } else {
      this.startBreathing();
    }
  }

  private startBreathing(): void {
    this.isBreathing = true;
    this.runInhale();
  }

  private stopBreathing(): void {
    this.isBreathing = false;
    this.breathPhase = 'ready';
    this.breathPhaseText = 'กดปุ่มเพื่อเริ่ม';
    if (this.breathTimer) clearInterval(this.breathTimer);
  }

  private runInhale(): void {
    if (!this.isBreathing) return;
    this.breathPhase = 'inhale';
    this.breathPhaseText = 'หายใจเข้าช้า ๆ';
    this.breathCountdown = 4;
    this.countDown(4, () => this.runHold());
  }

  private runHold(): void {
    if (!this.isBreathing) return;
    this.breathPhase = 'hold';
    this.breathPhaseText = 'กลั้นหายใจไว้';
    this.breathCountdown = 7;
    this.countDown(7, () => this.runExhale());
  }

  private runExhale(): void {
    if (!this.isBreathing) return;
    this.breathPhase = 'exhale';
    this.breathPhaseText = 'ผ่อนลมหายใจออกช้า ๆ';
    this.breathCountdown = 8;
    this.countDown(8, () => this.runInhale());
  }

  private countDown(seconds: number, onComplete: () => void): void {
    if (this.breathTimer) clearInterval(this.breathTimer);
    let rem = seconds;
    this.breathTimer = setInterval(() => {
      rem--;
      this.breathCountdown = rem;
      if (rem <= 0) {
        clearInterval(this.breathTimer);
        onComplete();
      }
    }, 1000);
  }

  public formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  }
}
