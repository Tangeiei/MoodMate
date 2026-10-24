import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { of, catchError, timeout } from 'rxjs';
import { MoodService } from '../../core/services/mood.service';
import { MoodEntry, MoodFactor } from '../../core/models/mood.model';

@Component({
  selector: 'app-mood-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-wrapper history-page">
      <div class="app-container">
        <!-- Page Title & Header -->
        <div class="history-header">
          <div>
            <h1>📜 ประวัติการบันทึกอารมณ์</h1>
            <p>ย้อนดูเส้นทางความรู้สึกและสิ่งที่คุณได้เรียนรู้ในแต่ละวัน</p>
          </div>
          <a routerLink="/mood-checkin" class="btn btn-primary">
            <span>✨</span> บันทึกอารมณ์ใหม่
          </a>
        </div>

        <!-- Filter Bar -->
        <div class="mm-card filter-card">
          <div class="filter-grid">
            <!-- Date Range -->
            <div class="filter-item">
              <label class="filter-label">ตั้งแต่วันที่</label>
              <div class="date-input-wrapper" [class.has-value]="filterStartDate">
                <input type="date" class="form-control" [(ngModel)]="filterStartDate" (change)="applyFilters()" />
                <span *ngIf="!filterStartDate" class="date-input-placeholder" aria-hidden="true">วัน/เดือน/ปี</span>
              </div>
            </div>

            <div class="filter-item">
              <label class="filter-label">ถึงวันที่</label>
              <div class="date-input-wrapper" [class.has-value]="filterEndDate">
                <input type="date" class="form-control" [(ngModel)]="filterEndDate" (change)="applyFilters()" />
                <span *ngIf="!filterEndDate" class="date-input-placeholder" aria-hidden="true">วัน/เดือน/ปี</span>
              </div>
            </div>

            <!-- Mood Score Filter -->
            <div class="filter-item">
              <label class="filter-label">ระดับอารมณ์</label>
              <select class="form-control" [(ngModel)]="filterMoodScore" (change)="applyFilters()">
                <option value="">ทุกระดับอารมณ์</option>
                <option value="5">5 - ดีมาก 😄</option>
                <option value="4">4 - ดี 🙂</option>
                <option value="3">3 - ปกติ 😐</option>
                <option value="2">2 - ไม่ค่อยดี 🙁</option>
                <option value="1">1 - แย่มาก 😞</option>
              </select>
            </div>

            <!-- Factor Filter -->
            <div class="filter-item">
              <label class="filter-label">ปัจจัยที่เกี่ยวข้อง</label>
              <select class="form-control" [(ngModel)]="filterFactorId" (change)="applyFilters()">
                <option value="">ทุกปัจจัย</option>
                <option *ngFor="let factor of factorsList" [value]="factor.id">{{ factor.name }}</option>
              </select>
            </div>

            <!-- Reset Filter Button -->
            <div class="filter-action">
              <button class="btn btn-outline btn-block" (click)="resetFilters()">ล้างตัวกรอง</button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-wrapper">
          <div class="spinner"></div>
          <p>กำลังค้นหาบันทึกของคุณ...</p>
        </div>

        <!-- Entries List -->
        <div *ngIf="!isLoading && loadError" class="mm-card empty-state" role="alert">
          <div class="empty-state-title">โหลดประวัติไม่สำเร็จ</div>
          <p class="empty-state-desc">เชื่อมต่อข้อมูลไม่ได้ในขณะนี้ กรุณาลองอีกครั้ง</p>
          <button class="btn btn-primary" (click)="loadEntries()">ลองอีกครั้ง</button>
        </div>

        <div *ngIf="!isLoading && !loadError">
          <div *ngIf="entries.length > 0; else noData" class="entries-stack">
            <div *ngFor="let entry of entries" class="mm-card entry-card">
              <div class="entry-header">
                <div class="entry-date-mood">
                  <span class="mood-icon">{{ getMoodEmoji(entry.mood_score) }}</span>
                  <div>
                    <div class="entry-date">{{ entry.entry_date }}</div>
                    <span class="badge-mood" [ngClass]="'badge-mood-' + entry.mood_score">
                      {{ entry.mood_label }} ({{ entry.mood_score }}/5)
                    </span>
                  </div>
                </div>

                <div class="entry-actions">
                  <a [routerLink]="['/mood-checkin']" [queryParams]="{ id: entry.id }" class="btn btn-outline btn-sm">
                    ✏️ แก้ไข
                  </a>
                  <button class="btn btn-outline btn-sm text-danger" (click)="deleteEntry(entry.id)">
                    🗑️ ลบ
                  </button>
                </div>
              </div>

              <!-- Stress Level -->
              <div *ngIf="entry.stress_level" class="entry-stress">
                <span class="stress-badge">
                  ความเครียด: {{ entry.stress_level }}/5 ({{ getStressLabel(entry.stress_level) }})
                </span>
              </div>

              <!-- Factors -->
              <div *ngIf="entry.factor_names?.length" class="entry-factors">
                <span *ngFor="let f of entry.factor_names" class="badge badge-factor-sm">{{ f }}</span>
              </div>

              <!-- Journal Text -->
              <div *ngIf="entry.journal_text" class="entry-journal">
                <p>{{ entry.journal_text }}</p>
              </div>
            </div>

            <!-- Pagination -->
            <div class="pagination-bar" *ngIf="totalPages > 1">
              <button
                class="btn btn-outline btn-sm"
                [disabled]="currentPage <= 1"
                (click)="goToPage(currentPage - 1)"
              >
                ◀ ก่อนหน้า
              </button>
              <span class="page-info">หน้า {{ currentPage }} จาก {{ totalPages }} (ทั้งหมด {{ totalCount }} รายการ)</span>
              <button
                class="btn btn-outline btn-sm"
                [disabled]="currentPage >= totalPages"
                (click)="goToPage(currentPage + 1)"
              >
                ถัดไป ▶
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <ng-template #noData>
            <div class="mm-card empty-state">
              <div class="empty-state-icon">🔍</div>
              <div class="empty-state-title">ไม่พบบันทึกอารมณ์</div>
              <p class="empty-state-desc">
                ไม่พบบันทึกอารมณ์ที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองปรับเปลี่ยนตัวกรอง หรือเริ่มบันทึกอารมณ์ใหม่
              </p>
              <button class="btn btn-secondary" (click)="resetFilters()" *ngIf="hasActiveFilters()">
                รีเซ็ตตัวกรองทั้งหมด
              </button>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .history-header h1 {
      font-size: 1.85rem;
      margin-bottom: 0.35rem;
    }

    .history-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .filter-card {
      margin-bottom: 2rem;
      padding: 1.25rem 1.5rem;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) 140px;
      gap: 1rem;
      align-items: flex-end;
    }

    .filter-label {
      font-size: 0.825rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      display: block;
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

    .btn-block {
      width: 100%;
    }

    /* Entry Cards */
    .entries-stack {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .entry-card {
      padding: 1.5rem;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .entry-date-mood {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .mood-icon {
      font-size: 2.25rem;
    }

    .entry-date {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .badge-mood {
      display: inline-block;
      font-size: 0.8rem;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      margin-top: 0.2rem;
    }

    .entry-actions {
      display: flex;
      gap: 0.5rem;
    }

    .text-danger {
      color: var(--accent-rose);
      border-color: #fecdd3;
    }

    .text-danger:hover {
      background: #fff1f2;
    }

    .entry-stress {
      margin: 0.5rem 0;
    }

    .stress-badge {
      font-size: 0.8rem;
      background: #f1f5f9;
      color: var(--text-muted);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
    }

    .entry-factors {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin: 0.65rem 0;
    }

    .badge-factor-sm {
      background: var(--primary-light);
      color: var(--primary);
      border-radius: var(--radius-full);
      padding: 0.2rem 0.6rem;
      font-size: 0.775rem;
      font-weight: 500;
    }

    .entry-journal {
      background: var(--bg-main);
      padding: 0.85rem 1.1rem;
      border-radius: var(--radius-md);
      margin-top: 0.75rem;
      border-left: 3px solid var(--primary);
      font-size: 0.925rem;
      color: var(--text-body);
      line-height: 1.6;
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.25rem;
      margin-top: 2.5rem;
    }

    .page-info {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .loading-wrapper {
      text-align: center;
      padding: 3rem 0;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .history-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
      .entry-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class MoodHistoryComponent implements OnInit {
  private moodService = inject(MoodService);
  private changeDetector = inject(ChangeDetectorRef);

  public isLoading = true;
  public loadError = false;
  public entries: MoodEntry[] = [];
  public factorsList: MoodFactor[] = [];

  // Filter models
  public filterStartDate = '';
  public filterEndDate = '';
  public filterMoodScore = '';
  public filterFactorId = '';

  // Pagination models
  public currentPage = 1;
  public totalPages = 1;
  public totalCount = 0;
  public limit = 10;

  ngOnInit(): void {
    this.loadFactors();
    this.loadEntries();
  }

  private loadFactors(): void {
    this.moodService.getFactors().pipe(
      catchError(() => of({ success: false, data: [] }))
    ).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.factorsList = res.data;
          this.changeDetector.markForCheck();
        }
      }
    });
  }

  public loadEntries(): void {
    this.isLoading = true;
    this.loadError = false;

    this.moodService.getMoods({
      start_date: this.filterStartDate || undefined,
      end_date: this.filterEndDate || undefined,
      mood_score: this.filterMoodScore || undefined,
      factor_id: this.filterFactorId || undefined,
      page: this.currentPage,
      limit: this.limit
    }).pipe(
      timeout({ first: 10000 }),
      catchError((err) => {
        console.warn('Mood history load warning:', err);
        return of({ success: false, data: [], pagination: { total: 0, page: 1, limit: this.limit, totalPages: 0 } });
      })
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && res.data) {
          this.entries = res.data;
          this.currentPage = res.pagination.page;
          this.totalPages = res.pagination.totalPages;
          this.totalCount = res.pagination.total;
        } else {
          this.entries = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.loadError = true;
        }
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.entries = [];
        this.loadError = true;
        this.changeDetector.markForCheck();
      }
    });
  }

  public applyFilters(): void {
    this.currentPage = 1;
    this.loadEntries();
  }

  public resetFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterMoodScore = '';
    this.filterFactorId = '';
    this.currentPage = 1;
    this.loadEntries();
  }

  public hasActiveFilters(): boolean {
    return !!(this.filterStartDate || this.filterEndDate || this.filterMoodScore || this.filterFactorId);
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEntries();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public deleteEntry(id: number): void {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกอารมณ์นี้?')) {
      this.moodService.deleteMood(id).subscribe({
        next: () => {
          this.loadEntries();
        },
        error: (err) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการลบบันทึก');
        }
      });
    }
  }

  public getMoodEmoji(score: number): string {
    const emojis: { [k: number]: string } = {
      1: '😞',
      2: '🙁',
      3: '😐',
      4: '🙂',
      5: '😄'
    };
    return emojis[score] || '😐';
  }

  public getStressLabel(score: number): string {
    const map: { [k: number]: string } = {
      1: 'ผ่อนคลาย',
      2: 'น้อย',
      3: 'ปานกลาง',
      4: 'ค่อนข้างมาก',
      5: 'มาก'
    };
    return map[score] || '';
  }
}
