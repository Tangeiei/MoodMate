import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MoodService } from '../../core/services/mood.service';
import { MoodFactor } from '../../core/models/mood.model';

@Component({
  selector: 'app-mood-checkin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper checkin-page">
      <div class="app-container">
        <div class="checkin-container">
          <div class="mm-card checkin-card">
            <!-- Header -->
            <div class="checkin-header">
              <h2>{{ isEditMode ? '✏️ แก้ไขบันทึกอารมณ์' : '🌱 บันทึกอารมณ์และความรู้สึก' }}</h2>
              <p>ให้เวลาหยุดพักสักครู่ สังเกตว่าตอนนี้ใจและกายของคุณกำลังรู้สึกอย่างไร</p>
            </div>

            <!-- Success Alert -->
            <div *ngIf="successMessage" class="alert alert-success">
              <span>✅</span>
              <span>{{ successMessage }}</span>
            </div>

            <!-- Error Alert -->
            <div *ngIf="errorMessage" class="alert alert-error">
              <span>⚠️</span>
              <span>{{ errorMessage }}</span>
              <a *ngIf="existingEntryId" [routerLink]="['/mood-checkin']" [queryParams]="{ id: existingEntryId }" class="btn btn-sm btn-outline ml-auto">
                ไปที่บันทึกเดิม
              </a>
            </div>

            <form [formGroup]="checkinForm" (ngSubmit)="onSubmit()">
              <!-- Date Picker -->
              <div class="form-group date-picker-group">
                <label class="form-label" for="entry_date">วันที่บันทึก</label>
                <div class="date-input-wrapper" [class.has-value]="checkinForm.get('entry_date')?.value">
                  <input
                    id="entry_date"
                    type="date"
                    class="form-control date-input"
                    formControlName="entry_date"
                    [max]="todayDate"
                  />
                  <span *ngIf="!checkinForm.get('entry_date')?.value" class="date-input-placeholder" aria-hidden="true">วัน/เดือน/ปี</span>
                </div>
              </div>

              <!-- Mood Score Selection (1-5 with Emojis) -->
              <div class="form-group mood-selection-group">
                <label class="form-label">
                  ระดับอารมณ์โดยรวม <span class="required">*</span>
                </label>
                <div class="mood-options">
                  <div
                    *ngFor="let opt of moodOptions"
                    class="mood-option"
                    [class.selected]="checkinForm.get('mood_score')?.value === opt.score"
                    [style.--opt-color]="opt.color"
                    (click)="selectMood(opt.score, opt.label)"
                  >
                    <span class="mood-emoji">{{ opt.emoji }}</span>
                    <span class="mood-score-badge">{{ opt.score }}</span>
                    <span class="mood-label">{{ opt.label }}</span>
                  </div>
                </div>
                <div *ngIf="checkinForm.get('mood_score')?.touched && checkinForm.get('mood_score')?.invalid" class="form-feedback-error text-center">
                  กรุณาเลือกระดับอารมณ์
                </div>
              </div>

              <!-- Stress Level (1-5 Optional) -->
              <div class="form-group stress-group">
                <label class="form-label">
                  ระดับความเครียดในวันนี้ <span class="optional">(ไม่บังคับ)</span>
                </label>
                <div class="stress-options">
                  <button
                    type="button"
                    *ngFor="let s of [1, 2, 3, 4, 5]"
                    class="stress-btn"
                    [class.active]="checkinForm.get('stress_level')?.value === s"
                    (click)="setStressLevel(s)"
                  >
                    {{ s }} - {{ getStressText(s) }}
                  </button>
                  <button
                    type="button"
                    class="stress-btn reset-btn"
                    *ngIf="checkinForm.get('stress_level')?.value"
                    (click)="setStressLevel(null)"
                  >
                    ✕ ล้างค่า
                  </button>
                </div>
              </div>

              <!-- Mood Factors Multi-Select -->
              <div class="form-group factors-group">
                <label class="form-label">
                  ปัจจัยที่ส่งผลต่ออารมณ์ของคุณ <span class="optional">(เลือกได้หลายข้อ)</span>
                </label>
                <div class="factors-grid">
                  <div
                    *ngFor="let factor of factorsList"
                    class="badge-factor"
                    [class.selected]="isFactorSelected(factor.id)"
                    (click)="toggleFactor(factor.id)"
                  >
                    {{ factor.name }}
                  </div>
                </div>
              </div>

              <!-- Journal / Feelings Text -->
              <div class="form-group">
                <label class="form-label" for="journal_text">
                  บันทึกความรู้สึกเพิ่มเติม (Journaling) <span class="optional">(ไม่บังคับ)</span>
                </label>
                <textarea
                  id="journal_text"
                  class="form-control journal-textarea"
                  formControlName="journal_text"
                  rows="4"
                  placeholder="เขียนสิ่งที่อยากระบาย สิ่งที่ได้เรียนรู้ หรือเรื่องที่ทำให้รู้สึกบางอย่างในวันนี้..."
                ></textarea>
                <div class="form-hint">พื้นที่ปลอดภัยสำหรับคุณ ข้อมูลนี้จะไม่ถูกเปิดเผยต่อใคร</div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  [disabled]="checkinForm.invalid || isSubmitting"
                >
                  <span *ngIf="isSubmitting" class="spinner-small"></span>
                  <span *ngIf="!isSubmitting">{{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกอารมณ์วันนี้' }}</span>
                </button>

                <button
                  *ngIf="isEditMode"
                  type="button"
                  class="btn btn-danger btn-lg"
                  (click)="confirmDelete()"
                >
                  ลบบันทึกนี้
                </button>

                <a routerLink="/dashboard" class="btn btn-outline btn-lg">ยกเลิก</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkin-container {
      max-width: 720px;
      margin: 0 auto;
    }

    .checkin-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .checkin-header h2 {
      font-size: 1.85rem;
      margin-bottom: 0.4rem;
    }

    .checkin-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .date-picker-group {
      max-width: 240px;
      margin-bottom: 2rem;
    }

    .date-input-wrapper {
      position: relative;
    }

    .date-input-placeholder {
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      color: #94a3b8;
      background: #ffffff;
      font-size: 0.95rem;
      line-height: 1;
      pointer-events: none;
    }

    .date-input-wrapper:not(.has-value) input[type="date"]::-webkit-datetime-edit {
      color: transparent;
    }

    /* Mood Selection Emojis */
    .mood-selection-group {
      margin-bottom: 2.25rem;
    }

    .mood-options {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.75rem;
      margin-top: 0.75rem;
    }

    .mood-option {
      background: var(--bg-main);
      border: 2px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.25rem 0.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
    }

    .mood-option:hover {
      transform: translateY(-3px);
      border-color: var(--opt-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .mood-option.selected {
      border-color: var(--opt-color);
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
      transform: translateY(-2px);
    }

    .mood-emoji {
      font-size: 2.25rem;
      line-height: 1;
    }

    .mood-score-badge {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .mood-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    /* Stress Buttons */
    .stress-group {
      margin-bottom: 2rem;
    }

    .stress-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .stress-btn {
      background: #ffffff;
      border: 1px solid var(--border-light);
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--text-body);
    }

    .stress-btn:hover {
      background: var(--bg-main);
    }

    .stress-btn.active {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .reset-btn {
      color: var(--accent-rose);
      border-color: #fecdd3;
    }

    /* Factors Badges */
    .factors-group {
      margin-bottom: 2rem;
    }

    .factors-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.5rem;
    }

    .journal-textarea {
      min-height: 110px;
    }

    .form-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .required {
      color: var(--accent-rose);
    }

    .optional {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .ml-auto {
      margin-left: auto;
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

    @media (max-width: 640px) {
      .mood-options {
        grid-template-columns: repeat(3, 1fr);
      }
      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .form-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class MoodCheckinComponent implements OnInit {
  private fb = inject(FormBuilder);
  private moodService = inject(MoodService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isEditMode = false;
  public entryId: number | null = null;
  public isSubmitting = false;
  public successMessage: string | null = null;
  public errorMessage: string | null = null;
  public existingEntryId: number | null = null;

  public todayDate: string = new Date().toISOString().split('T')[0];
  public factorsList: MoodFactor[] = [];
  public selectedFactorIds: number[] = [];

  public moodOptions = [
    { score: 1, label: 'แย่มาก', emoji: '😞', color: 'var(--mood-1)' },
    { score: 2, label: 'ไม่ค่อยดี', emoji: '🙁', color: 'var(--mood-2)' },
    { score: 3, label: 'ปกติ', emoji: '😐', color: 'var(--mood-3)' },
    { score: 4, label: 'ดี', emoji: '🙂', color: 'var(--mood-4)' },
    { score: 5, label: 'ดีมาก', emoji: '😄', color: 'var(--mood-5)' }
  ];

  public checkinForm: FormGroup = this.fb.group({
    entry_date: [this.todayDate, [Validators.required]],
    mood_score: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    mood_label: [''],
    stress_level: [null],
    journal_text: ['']
  });

  ngOnInit(): void {
    this.loadFactors();

    // Check if edit mode via queryParam ?id=...
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.entryId = parseInt(params['id'], 10);
        this.isEditMode = true;
        this.loadExistingEntry(this.entryId);
      }
    });
  }

  private loadFactors(): void {
    this.moodService.getFactors().subscribe({
      next: (res) => {
        if (res.success) {
          this.factorsList = res.data;
        }
      }
    });
  }

  private loadExistingEntry(id: number): void {
    this.moodService.getMoodById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const entry = res.data;
          this.checkinForm.patchValue({
            entry_date: entry.entry_date,
            mood_score: entry.mood_score,
            mood_label: entry.mood_label,
            stress_level: entry.stress_level,
            journal_text: entry.journal_text
          });
          this.selectedFactorIds = entry.factor_ids || [];
        }
      },
      error: () => {
        this.errorMessage = 'ไม่พบข้อมูลบันทึกที่ต้องการแก้ไข';
      }
    });
  }

  public selectMood(score: number, label: string): void {
    this.checkinForm.patchValue({
      mood_score: score,
      mood_label: label
    });
  }

  public setStressLevel(level: number | null): void {
    this.checkinForm.patchValue({ stress_level: level });
  }

  public getStressText(level: number): string {
    const map: { [k: number]: string } = {
      1: 'ผ่อนคลายมาก',
      2: 'น้อย',
      3: 'ปานกลาง',
      4: 'ค่อนข้างเครียด',
      5: 'เครียดมาก'
    };
    return map[level] || '';
  }

  public toggleFactor(factorId: number): void {
    const idx = this.selectedFactorIds.indexOf(factorId);
    if (idx > -1) {
      this.selectedFactorIds.splice(idx, 1);
    } else {
      this.selectedFactorIds.push(factorId);
    }
  }

  public isFactorSelected(factorId: number): boolean {
    return this.selectedFactorIds.includes(factorId);
  }

  public onSubmit(): void {
    if (this.checkinForm.invalid) {
      this.checkinForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.existingEntryId = null;

    const payload = {
      ...this.checkinForm.value,
      factor_ids: this.selectedFactorIds
    };

    if (this.isEditMode && this.entryId) {
      this.moodService.updateMood(this.entryId, payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.successMessage = res.message || 'แก้ไขบันทึกสำเร็จ';
          setTimeout(() => this.router.navigate(['/dashboard']), 1200);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาดในการแก้ไขบันทึก';
        }
      });
    } else {
      this.moodService.createMood(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.successMessage = res.message || 'บันทึกอารมณ์สำเร็จ ขอบคุณที่ดูแลใจตัวเอง';
          setTimeout(() => this.router.navigate(['/dashboard']), 1200);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาดในการบันทึกอารมณ์';
          if (err.status === 409 && err.error?.existing_id) {
            this.existingEntryId = err.error.existing_id;
          }
        }
      });
    }
  }

  public confirmDelete(): void {
    if (!this.entryId) return;
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกอารมณ์ของวันนี้?')) {
      this.moodService.deleteMood(this.entryId).subscribe({
        next: () => {
          alert('ลบบันทึกอารมณ์เรียบร้อยแล้ว');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาดในการลบบันทึก';
        }
      });
    }
  }
}
