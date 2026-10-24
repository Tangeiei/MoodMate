import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="app-container">
          <div class="hero-content">
            <div class="hero-badge">🌱 เพื่อนคู่ใจในการเรียนและใช้ชีวิต</div>
            <h1 class="hero-title">
              เข้าใจทุกความรู้สึก...<br>
              ดูแลใจไปด้วยกันกับ <span class="highlight">MoodMate</span>
            </h1>
            <p class="hero-subtitle">
              เว็บแอปพลิเคชันสำหรับนักศึกษา เพื่อบันทึกอารมณ์รายวัน ติดตามปัจจัยความเครียด 
              และค้นพบแนวทางฟื้นฟูพลังใจที่เหมาะกับคุณ — ใช้งานง่าย เป็นส่วนตัว และไม่มีค่าใช้จ่าย
            </p>
            <div class="hero-actions">
              <a routerLink="/register" class="btn btn-primary btn-lg">เริ่มต้นใช้งานฟรี ✨</a>
              <a routerLink="/login" class="btn btn-outline btn-lg">เข้าสู่ระบบ</a>
            </div>
            <div class="hero-stats-preview">
              <div class="preview-item">
                <span class="preview-emoji">😊</span>
                <span>บันทึกง่ายใน 1 นาที</span>
              </div>
              <div class="preview-item">
                <span class="preview-emoji">📊</span>
                <span>วิเคราะห์สถิติรายสัปดาห์</span>
              </div>
              <div class="preview-item">
                <span class="preview-emoji">🔒</span>
                <span>ข้อมูลส่วนตัวปลอดภัย</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3 Steps Section -->
      <section class="steps-section">
        <div class="app-container">
          <div class="section-header">
            <h2>3 ขั้นตอนง่าย ๆ เพื่อสุขภาพใจที่ดีขึ้น</h2>
            <p>การสังเกตอารมณ์ตนเองคือจุดเริ่มต้นของการสร้างภูมิคุ้มกันทางใจ</p>
          </div>

          <div class="grid grid-3 steps-grid">
            <div class="mm-card step-card">
              <div class="step-num">01</div>
              <div class="step-icon">📝</div>
              <h3>เช็กอินอารมณ์ประจำวัน</h3>
              <p>เลือกคะแนนอารมณ์ 1-5 พร้อมบันทึกปัจจัยที่เกี่ยวข้อง เช่น การเรียน การสอบ ครอบครัว หรือการนอนหลับ</p>
            </div>

            <div class="mm-card step-card">
              <div class="step-num">02</div>
              <div class="step-icon">📈</div>
              <h3>ดูแนวโน้มและสถิติ</h3>
              <p>สำรวจกราฟอารมณ์ 7 วัน และ 30 วัน เพื่อเข้าใจรูปแบบความเครียดและสิ่งที่ทำให้คุณมีความสุขบ่อยที่สุด</p>
            </div>

            <div class="mm-card step-card">
              <div class="step-num">03</div>
              <div class="step-icon">🧘‍♀️</div>
              <h3>ผ่อนคลายด้วย Self-care</h3>
              <p>ทำกิจกรรมดูแลใจสั้น ๆ เช่น เทคนิคฝึกหายใจ 4-7-8 พักสายตา หรือฟังดนตรีบำบัดเพื่อเติมพลัง</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy & Ethics Section -->
      <section class="privacy-section">
        <div class="app-container">
          <div class="mm-card privacy-card">
            <div class="privacy-content">
              <div class="privacy-badge">🛡️ สิทธิและความเป็นส่วนตัวของคุณคือเรื่องสำคัญที่สุด</div>
              <h2>ความปลอดภัยของข้อมูลใน MoodMate</h2>
              <p>
                เราเข้าใจดีว่าบันทึกความรู้สึกเป็นข้อมูลที่ละเอียดอ่อน ข้อมูลของคุณจะถูกเข้ารหัสผ่านและแยกสิทธิ์อย่างเคร่งครัด
                ไม่มีการส่งต่อข้อมูลให้กับบุคคลที่สาม และคุณสามารถลบบัญชีพร้อมประวัติทั้งหมดออกจากระบบได้ตลอดเวลาตามต้องการ
              </p>
              <div class="privacy-checklist">
                <div class="check-item">✓ เก็บรหัสผ่านด้วยการ Hash ที่ได้มาตรฐานความปลอดภัยสูง</div>
                <div class="check-item">✓ ผู้ใช้อื่นไม่สามารถมองเห็นบันทึกของคุณได้โดยเด็ดขาด</div>
                <div class="check-item">✓ ไม่มีการใช้ AI นำข้อมูลส่วนบุคคลของคุณไปเทรนโมเดล</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action Banner -->
      <section class="cta-section">
        <div class="app-container">
          <div class="cta-box">
            <h2>พร้อมเริ่มต้นดูแลใจของตัวเองแล้วหรือยัง?</h2>
            <p>สมัครสมาชิกในไม่กี่วินาทีเพื่อเริ่มต้นการเดินทางที่อบอุ่นไปด้วยกัน</p>
            <a routerLink="/register" class="btn btn-primary btn-lg">สมัครสมาชิก MoodMate ตอนนี้</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      padding-bottom: 3rem;
    }

    .hero-section {
      padding: 4.5rem 0 3.5rem;
      background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
      text-align: center;
    }

    .hero-badge {
      display: inline-block;
      background: #ffffff;
      color: var(--primary);
      border: 1px solid var(--primary-border);
      border-radius: var(--radius-full);
      padding: 0.35rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
      box-shadow: var(--shadow-sm);
    }

    .hero-title {
      font-size: 2.75rem;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 1.25rem;
      color: var(--text-main);
    }

    .hero-title .highlight {
      color: var(--primary);
      background: linear-gradient(120deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      max-width: 680px;
      margin: 0 auto 2rem;
      font-size: 1.125rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .hero-stats-preview {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      flex-wrap: wrap;
      color: var(--text-body);
      font-size: 0.95rem;
    }

    .preview-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preview-emoji {
      font-size: 1.25rem;
    }

    /* Steps Section */
    .steps-section {
      padding: 4rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: var(--text-muted);
      font-size: 1.05rem;
    }

    .step-card {
      position: relative;
      text-align: center;
      padding: 2.25rem 1.5rem;
    }

    .step-num {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      font-size: 1.75rem;
      font-weight: 800;
      color: #e2e8f0;
    }

    .step-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .step-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }

    .step-card p {
      color: var(--text-muted);
      font-size: 0.925rem;
    }

    /* Privacy Section */
    .privacy-section {
      padding: 2rem 0;
    }

    .privacy-card {
      background: linear-gradient(135deg, #fdf4ff 0%, #eff6ff 100%);
      border: 1px solid #e0e7ff;
      padding: 3rem;
    }

    .privacy-badge {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-purple);
      margin-bottom: 1rem;
    }

    .privacy-card h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }

    .privacy-card p {
      font-size: 1rem;
      color: var(--text-body);
      max-width: 800px;
      margin-bottom: 1.5rem;
    }

    .privacy-checklist {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .check-item {
      font-weight: 500;
      color: #334155;
    }

    /* CTA Section */
    .cta-section {
      padding: 3.5rem 0 1rem;
    }

    .cta-box {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      border-radius: var(--radius-lg);
      padding: 3.5rem 2rem;
      text-align: center;
      box-shadow: var(--shadow-lg);
    }

    .cta-box h2 {
      color: #ffffff;
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .cta-box p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .cta-box .btn-primary {
      background: #ffffff;
      color: var(--primary);
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .cta-box .btn-primary:hover {
      background: #f8fafc;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }
      .hero-actions {
        flex-direction: column;
      }
      .privacy-card {
        padding: 1.75rem;
      }
    }
  `]
})
export class LandingComponent {}
