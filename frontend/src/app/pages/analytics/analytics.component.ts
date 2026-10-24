import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { MoodAnalyticsResponse } from '../../core/models/analytics.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper analytics-page">
      <div class="app-container">
        <!-- Header -->
        <div class="analytics-header">
          <div>
            <h1>📊 สถิติและแนวโน้มสุขภาพใจ</h1>
            <p>ทำความเข้าใจรูปแบบอารมณ์ของคุณอย่างเป็นกลาง เพื่อดูแลตัวเองได้อย่างตรงจุด</p>
          </div>

          <!-- Period Toggle -->
          <div class="period-toggle">
            <button
              class="period-btn"
              [class.active]="selectedPeriod === '7d'"
              (click)="changePeriod('7d')"
            >
              7 วันล่าสุด
            </button>
            <button
              class="period-btn"
              [class.active]="selectedPeriod === '30d'"
              (click)="changePeriod('30d')"
            >
              30 วันล่าสุด
            </button>
          </div>
        </div>

        <!-- Supportive Insight Card -->
        <div class="mm-card insight-card" *ngIf="analyticsData">
          <div class="insight-icon">🌱</div>
          <div class="insight-content">
            <h3>ข้อสังเกตและข้อคิดเพื่อใจของคุณ</h3>
            <p>{{ analyticsData.insight }}</p>
          </div>
        </div>

        <!-- Metrics Overview -->
        <div class="grid grid-3 summary-grid" *ngIf="analyticsData">
          <div class="mm-card summary-card">
            <div class="summary-label">จำนวนวันที่บันทึกในช่วงนี้</div>
            <div class="summary-num">{{ analyticsData.summary.total_entries }} <span class="summary-unit">วัน</span></div>
          </div>

          <div class="mm-card summary-card">
            <div class="summary-label">ระดับอารมณ์เฉลี่ย</div>
            <div class="summary-num">{{ analyticsData.summary.average_mood || '-' }} <span class="summary-unit">/ 5.0</span></div>
          </div>

          <div class="mm-card summary-card">
            <div class="summary-label">ระดับความเครียดเฉลี่ย</div>
            <div class="summary-num">{{ analyticsData.summary.average_stress || '-' }} <span class="summary-unit">/ 5.0</span></div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- Trend Chart -->
          <div class="mm-card chart-box">
            <div class="chart-header">
              <h3>📈 กราฟแนวโน้มอารมณ์รายวัน</h3>
              <span class="chart-subtitle">แสดงคะแนนอารมณ์ 1-5 ตามลำดับเวลา</span>
            </div>
            <div class="canvas-wrapper">
              <canvas #trendChartCanvas></canvas>
            </div>
            <div *ngIf="!analyticsData?.trend?.length" class="empty-chart-text">
              ยังไม่มีข้อมูลบันทึกในช่วงเวลานี้
            </div>
          </div>

          <!-- Score Distribution Chart -->
          <div class="mm-card chart-box">
            <div class="chart-header">
              <h3>🎯 สัดส่วนระดับอารมณ์</h3>
              <span class="chart-subtitle">จำนวนครั้งที่รู้สึกในแต่ละระดับ</span>
            </div>
            <div class="canvas-wrapper">
              <canvas #distChartCanvas></canvas>
            </div>
            <div *ngIf="!analyticsData?.summary?.total_entries" class="empty-chart-text">
              ยังไม่มีข้อมูลเพียงพอสำหรับแสดงสัดส่วน
            </div>
          </div>
        </div>

        <!-- Top Influencing Factors -->
        <div class="mm-card factors-breakdown-card" *ngIf="analyticsData">
          <h3>🔍 ปัจจัยที่มีผลต่ออารมณ์ของคุณมากที่สุด</h3>
          <p class="subtitle">สถิติจำนวนครั้งที่ปัจจัยเหล่านี้ถูกเชื่อมโยงในบันทึกของคุณ</p>

          <div *ngIf="analyticsData.top_factors?.length; else noFactors" class="factors-chart-list">
            <div *ngFor="let factor of analyticsData.top_factors" class="factor-bar-row">
              <div class="factor-info">
                <span class="factor-title">{{ factor.name }}</span>
                <span class="factor-count">{{ factor.count }} ครั้ง</span>
              </div>
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  [style.width.%]="getFactorPercentage(factor.count)"
                ></div>
              </div>
            </div>
          </div>

          <ng-template #noFactors>
            <div class="empty-state">
              <div class="empty-state-icon">🍃</div>
              <p>ยังไม่มีข้อมูลปัจจัยในช่วงเวลานี้ บันทึกอารมณ์พร้อมระบุปัจจัยเพื่อดูสถิติ</p>
            </div>
          </ng-template>
        </div>

        <!-- Disclaimer Note -->
        <div class="analytics-disclaimer">
          <span>ℹ️</span>
          <span>
            หมายเหตุ: ข้อมูลสถิติข้างต้นมีไว้เพื่อการสะท้อนความรู้สึกตนเองเท่านั้น ไม่สามารถใช้เป็นข้อสรุปทางการแพทย์
            หรือการวินิจฉัยภาวะซึมเศร้าได้ หากท่านมีความกังวลใจ แนะนำให้ปรึกษาอาจารย์ที่ปรึกษาหรือผู้เชี่ยวชาญด้านสุขภาพจิต
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1.5rem;
    }

    .analytics-header h1 {
      font-size: 1.85rem;
      margin-bottom: 0.35rem;
    }

    .analytics-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .period-toggle {
      display: flex;
      background: #e2e8f0;
      padding: 3px;
      border-radius: var(--radius-md);
      gap: 3px;
    }

    .period-btn {
      border: none;
      background: transparent;
      padding: 0.5rem 1rem;
      border-radius: calc(var(--radius-md) - 2px);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-body);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .period-btn.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: var(--shadow-sm);
      font-weight: 600;
    }

    /* Insight Card */
    .insight-card {
      background: linear-gradient(135deg, #eff6ff 0%, #fdf4ff 100%);
      border: 1px solid #dbeafe;
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.5rem 1.75rem;
      margin-bottom: 2rem;
    }

    .insight-icon {
      font-size: 2rem;
      line-height: 1;
    }

    .insight-content h3 {
      font-size: 1.15rem;
      margin-bottom: 0.4rem;
      color: var(--primary);
    }

    .insight-content p {
      color: var(--text-body);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .summary-grid {
      margin-bottom: 2rem;
    }

    .summary-card {
      text-align: center;
      padding: 1.5rem;
    }

    .summary-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }

    .summary-num {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .summary-unit {
      font-size: 0.95rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Charts Grid */
    .charts-grid {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-box {
      padding: 1.5rem;
    }

    .chart-header {
      margin-bottom: 1.25rem;
    }

    .chart-header h3 {
      font-size: 1.15rem;
      margin-bottom: 0.2rem;
    }

    .chart-subtitle {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .canvas-wrapper {
      position: relative;
      height: 280px;
      width: 100%;
    }

    .empty-chart-text {
      text-align: center;
      padding: 3rem 0;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* Factors Breakdown */
    .factors-breakdown-card {
      padding: 1.75rem;
      margin-bottom: 2rem;
    }

    .factors-breakdown-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }

    .factors-breakdown-card .subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .factors-chart-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .factor-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
      font-size: 0.925rem;
    }

    .factor-title {
      font-weight: 500;
      color: var(--text-main);
    }

    .factor-count {
      color: var(--primary);
      font-weight: 600;
    }

    .progress-bar-bg {
      background: #f1f5f9;
      height: 10px;
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.5s ease;
    }

    .analytics-disclaimer {
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

    @media (max-width: 868px) {
      .analytics-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);

  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distChartCanvas') distChartCanvas!: ElementRef<HTMLCanvasElement>;

  private trendChart: Chart | null = null;
  private distChart: Chart | null = null;

  public selectedPeriod: '7d' | '30d' = '7d';
  public analyticsData: MoodAnalyticsResponse | null = null;

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    // Charts render after data loads
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    if (this.distChart) {
      this.distChart.destroy();
      this.distChart = null;
    }
  }

  public changePeriod(period: '7d' | '30d'): void {
    if (this.selectedPeriod === period) return;
    this.selectedPeriod = period;
    this.loadAnalytics();
  }

  public loadAnalytics(): void {
    this.analyticsService.getMoodAnalytics(this.selectedPeriod).subscribe({
      next: (res) => {
        if (res.success) {
          this.analyticsData = res;
          setTimeout(() => this.renderCharts(), 100);
        }
      }
    });
  }

  private renderCharts(): void {
    if (!this.analyticsData) return;
    this.destroyCharts();

    // 1. Trend Chart
    if (this.trendChartCanvas && this.analyticsData.trend.length > 0) {
      const ctx = this.trendChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.trendChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.analyticsData.trend.map(t => t.date),
            datasets: [{
              label: 'ระดับอารมณ์',
              data: this.analyticsData.trend.map(t => t.mood_score),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#6366f1',
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 1,
                max: 5,
                ticks: { stepSize: 1 }
              }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }

    // 2. Distribution Chart (Bar or Doughnut)
    if (this.distChartCanvas && this.analyticsData.summary.total_entries > 0) {
      const ctx = this.distChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const dist = this.analyticsData.distribution;
        this.distChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['1 แย่มาก 😞', '2 ไม่ค่อยดี 🙁', '3 ปกติ 😐', '4 ดี 🙂', '5 ดีมาก 😄'],
            datasets: [{
              data: [dist[1] || 0, dist[2] || 0, dist[3] || 0, dist[4] || 0, dist[5] || 0],
              backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, font: { size: 11 } }
              }
            }
          }
        });
      }
    }
  }

  public getFactorPercentage(count: number): number {
    if (!this.analyticsData || !this.analyticsData.summary.total_entries) return 0;
    const max = Math.max(...this.analyticsData.top_factors.map(f => f.count), 1);
    return Math.min(100, Math.round((count / max) * 100));
  }
}
