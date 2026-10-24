import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MoodService } from '../../core/services/mood.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { MoodEntry } from '../../core/models/mood.model';
import { MoodAnalyticsResponse } from '../../core/models/analytics.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper dashboard-page">
      <div class="app-container">
        <!-- Welcome Greeting & Quick Check-in Header -->
        <div class="dashboard-header mm-card">
          <div class="header-content">
            <div class="user-welcome">
              <h1>สวัสดีคุณ {{ authService.currentUser()?.display_name }} 🌿</h1>
              <p>วันนี้ใจของคุณเป็นอย่างไรบ้าง? อย่าลืมแวะมาฟังเสียงความรู้สึกตัวเองนะ</p>
            </div>
            <div class="header-action">
              <a routerLink="/mood-checkin" class="btn btn-primary btn-lg">
                <span>✨</span> บันทึกอารมณ์วันนี้
              </a>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-wrapper">
          <div class="spinner"></div>
          <p>กำลังโหลดข้อมูลสุขภาพใจของคุณ...</p>
        </div>

        <!-- Dashboard Content -->
        <div *ngIf="!isLoading" class="dashboard-grid">
          <!-- Metric Cards -->
          <div class="grid grid-3 metrics-row">
            <!-- Latest Mood -->
            <div class="mm-card metric-card">
              <div class="metric-label">อารมณ์ล่าสุดของคุณ</div>
              <div *ngIf="recentEntries.length > 0; else noLatestMood" class="metric-body">
                <span class="mood-big-emoji">{{ getMoodEmoji(recentEntries[0].mood_score) }}</span>
                <div>
                  <div class="mood-title" [ngClass]="'badge-mood-' + recentEntries[0].mood_score">
                    {{ recentEntries[0].mood_label }} (ระดับ {{ recentEntries[0].mood_score }}/5)
                  </div>
                  <div class="metric-sub">{{ recentEntries[0].entry_date }}</div>
                </div>
              </div>
              <ng-template #noLatestMood>
                <div class="empty-metric">ยังไม่มีบันทึกอารมณ์</div>
              </ng-template>
            </div>

            <!-- Total Days Logged -->
            <div class="mm-card metric-card">
              <div class="metric-label">จำนวนวันที่บันทึกทั้งหมด</div>
              <div class="metric-value">
                <span class="value-number">{{ totalEntries }}</span>
                <span class="value-unit">วัน</span>
              </div>
              <div class="metric-sub">ขอบคุณที่ให้เวลาดูแลตัวเองอย่างสม่ำเสมอ</div>
            </div>

            <!-- Weekly Average -->
            <div class="mm-card metric-card">
              <div class="metric-label">ค่าเฉลี่ยอารมณ์ (7 วันล่าสุด)</div>
              <div class="metric-value">
                <span class="value-number">{{ analyticsData?.summary?.average_mood || '-' }}</span>
                <span class="value-unit">/ 5.0</span>
              </div>
              <div class="metric-sub">
                ความเครียดเฉลี่ย: {{ analyticsData?.summary?.average_stress || '-' }} / 5
              </div>
            </div>
          </div>

          <!-- Chart & Top Factors Row -->
          <div class="analytics-row">
            <!-- 7-Day Trend Chart -->
            <div class="mm-card chart-card">
              <div class="card-header">
                <h3>📈 แนวโน้มอารมณ์ 7 วันล่าสุด</h3>
                <a routerLink="/analytics" class="btn btn-outline btn-sm">ดูสถิติฉบับเต็ม</a>
              </div>
              <div class="chart-container">
                <canvas #trendChartCanvas></canvas>
              </div>
              <div *ngIf="!analyticsData?.trend?.length" class="empty-chart-notice">
                ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ ลองเริ่มบันทึกอารมณ์ดูนะ!
              </div>
            </div>

            <!-- Top Influencing Factors -->
            <div class="mm-card factors-card">
              <h3>🎯 ปัจจัยที่ส่งผลต่อใจบ่อยที่สุด</h3>
              <p class="factors-desc">สิ่งที่เกี่ยวข้องกับอารมณ์ของคุณในช่วงนี้</p>
              
              <div *ngIf="analyticsData?.top_factors?.length; else noFactors" class="factors-list">
                <div *ngIf="analyticsData" class="factor-items">
                  <div *ngFor="let f of analyticsData.top_factors" class="factor-item">
                    <span class="factor-name">{{ f.name }}</span>
                    <span class="factor-badge">{{ f.count }} ครั้ง</span>
                  </div>
                </div>
              </div>
              <ng-template #noFactors>
                <div class="empty-state-mini">
                  <span>🍃</span>
                  <p>ยังไม่มีข้อมูลปัจจัย ลองระบุปัจจัยในบันทึกอารมณ์</p>
                </div>
              </ng-template>

              <!-- Helpful self-care prompt -->
              <div class="self-care-box">
                <div class="box-icon">💡</div>
                <div class="box-content">
                  <strong>รู้สึกเหนื่อยล้าหรือเปล่า?</strong>
                  <p>แวะทำกิจกรรมพักสายตาหรือฝึกหายใจสั้น ๆ ได้ที่หน้ากิจกรรมดูแลใจ</p>
                  <a routerLink="/activities" class="btn btn-secondary btn-sm">ทำกิจกรรม Self-care</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Entries List -->
          <div class="mm-card recent-entries-card">
            <div class="card-header">
              <h3>📝 รายการบันทึกล่าสุด</h3>
              <a routerLink="/mood-history" class="btn btn-outline btn-sm">ดูประวัติทั้งหมด</a>
            </div>

            <div *ngIf="recentEntries.length > 0; else noEntries" class="entries-table-wrapper">
              <table class="entries-table">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>ระดับอารมณ์</th>
                    <th>ปัจจัยที่เกี่ยวข้อง</th>
                    <th>บันทึกความรู้สึก</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of recentEntries">
                    <td class="date-cell">{{ item.entry_date }}</td>
                    <td>
                      <span class="mood-pill" [ngClass]="'badge-mood-' + item.mood_score">
                        {{ getMoodEmoji(item.mood_score) }} {{ item.mood_label }}
                      </span>
                    </td>
                    <td>
                      <div class="factors-cell">
                        <span *ngFor="let f of item.factor_names" class="badge badge-primary">{{ f }}</span>
                        <span *ngIf="!item.factor_names?.length" class="text-muted">-</span>
                      </div>
                    </td>
                    <td class="journal-cell">
                      {{ item.journal_text || '-' }}
                    </td>
                    <td>
                      <a [routerLink]="['/mood-checkin']" [queryParams]="{ id: item.id }" class="action-link">แก้ไข</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noEntries>
              <div class="empty-state">
                <div class="empty-state-icon">🌱</div>
                <div class="empty-state-title">ยินดีต้อนรับสู่ก้าวแรกของคุณ</div>
                <p class="empty-state-desc">ยังไม่มีบันทึกอารมณ์ในระบบ มาเริ่มต้นบันทึกความรู้สึกแรกของคุณวันนี้กันเถอะ</p>
                <a routerLink="/mood-checkin" class="btn btn-primary">บันทึกอารมณ์ตอนนี้</a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      background: linear-gradient(135deg, #f0fdf4 0%, #eef2ff 100%);
      border: 1px solid #dbeafe;
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    .user-welcome h1 {
      font-size: 1.85rem;
      margin-bottom: 0.35rem;
    }

    .user-welcome p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .metrics-row {
      margin-bottom: 2rem;
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .metric-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .metric-body {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0.5rem 0;
    }

    .mood-big-emoji {
      font-size: 2.5rem;
    }

    .mood-title {
      font-size: 1.05rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    .metric-value {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      margin: 0.25rem 0 0.5rem;
    }

    .value-number {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .value-unit {
      font-size: 1rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .metric-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .empty-metric {
      font-size: 0.95rem;
      color: var(--text-muted);
      padding: 0.75rem 0;
    }

    /* Analytics Row */
    .analytics-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .chart-container {
      position: relative;
      height: 260px;
      width: 100%;
    }

    .empty-chart-notice {
      text-align: center;
      color: var(--text-muted);
      padding: 2rem 0;
      font-size: 0.9rem;
    }

    .factors-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .factor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-light);
      font-size: 0.9rem;
    }

    .factor-badge {
      background: var(--primary-light);
      color: var(--primary);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .empty-state-mini {
      text-align: center;
      padding: 1.5rem 0;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .empty-state-mini span {
      font-size: 1.5rem;
    }

    .self-care-box {
      margin-top: 1.5rem;
      background: #fdf4ff;
      border: 1px solid #fbcfe8;
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .self-care-box strong {
      display: block;
      color: var(--text-main);
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .self-care-box p {
      font-size: 0.825rem;
      color: var(--text-body);
      margin-bottom: 0.65rem;
    }

    /* Recent Entries Table */
    .entries-table-wrapper {
      overflow-x: auto;
    }

    .entries-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      text-align: left;
    }

    .entries-table th {
      padding: 0.75rem 1rem;
      background: var(--bg-main);
      color: var(--text-muted);
      font-weight: 500;
      border-bottom: 1px solid var(--border-light);
    }

    .entries-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
    }

    .mood-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-full);
      font-size: 0.825rem;
      font-weight: 500;
    }

    .factors-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .journal-cell {
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-body);
    }

    .action-link {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .loading-wrapper {
      text-align: center;
      padding: 4rem 0;
      color: var(--text-muted);
    }

    .loading-wrapper p {
      margin-top: 1rem;
    }

    @media (max-width: 868px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
      .analytics-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  public authService = inject(AuthService);
  private moodService = inject(MoodService);
  private analyticsService = inject(AnalyticsService);

  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  public isLoading = true;
  public recentEntries: MoodEntry[] = [];
  public totalEntries = 0;
  public analyticsData: MoodAnalyticsResponse | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data loads
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Load recent entries
    this.moodService.getMoods({ page: 1, limit: 5 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.recentEntries = res.data;
          this.totalEntries = res.pagination.total;
        }
      }
    });

    // Load 7-day analytics
    this.analyticsService.getMoodAnalytics('7d').subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.analyticsData = res;
          setTimeout(() => this.renderTrendChart(), 100);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private renderTrendChart(): void {
    if (!this.trendChartCanvas || !this.analyticsData?.trend) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.trendChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.analyticsData.trend.map(t => t.date);
    const dataPoints = this.analyticsData.trend.map(t => t.mood_score);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'คะแนนอารมณ์ (1-5)',
          data: dataPoints,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#6366f1',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 1,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: (val) => {
                const map: { [k: number]: string } = {
                  1: '1 แย่มาก',
                  2: '2 ไม่ค่อยดี',
                  3: '3 ปกติ',
                  4: '4 ดี',
                  5: '5 ดีมาก'
                };
                return map[val as number] || val;
              }
            },
            grid: {
              color: '#f1f5f9'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (item) => `ระดับอารมณ์: ${item.parsed.y}/5`
            }
          }
        }
      }
    });
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
}
