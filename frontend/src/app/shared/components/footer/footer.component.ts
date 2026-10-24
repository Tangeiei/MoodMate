import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="app-container">
        <div class="footer-grid">
          <div class="footer-info">
            <div class="footer-logo">
              <span>🌱</span> <strong>MoodMate</strong>
            </div>
            <p class="footer-desc">
              เว็บแอปพลิเคชันติดตามอารมณ์และดูแลสุขภาพใจสำหรับนักศึกษา เพื่อเป็นพื้นที่ปลอดภัยในการรับรู้และเข้าใจความรู้สึกของตนเอง
            </p>
          </div>

          <div class="footer-disclaimer">
            <h4 class="disclaimer-title">💡 ข้อควรทราบและสายด่วนช่วยเหลือ</h4>
            <p class="disclaimer-text">
              MoodMate จัดทำขึ้นเพื่อการติดตามและดูแลสุขภาพใจเบื้องต้น ไม่ใช่การวินิจฉัยหรือการรักษาทางการแพทย์ หากคุณกำลังเผชิญกับวิกฤตทางอารมณ์หรือมีความคิดทำร้ายตนเอง สามารถติดต่อขอความช่วยเหลือได้ฟรี:
            </p>
            <div class="helpline-box">
              <span>📞 สายด่วนสุขภาพจิต: <strong>1323</strong> (โทรฟรี 24 ชม.)</span>
              <span>💬 สมาคมสะมาริตันส์แห่งประเทศไทย: <strong>02-113-6789</strong></span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2025-2026 MoodMate Project — พัฒนาเพื่อการศึกษา ไม่แสวงหาผลกำไร</p>
          <div class="bottom-links">
            <a routerLink="/profile">นโยบายความเป็นส่วนตัว</a>
            <span>•</span>
            <a href="https://github.com" target="_blank" rel="noopener">GitHub Repository</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #ffffff;
      border-top: 1px solid var(--border-light);
      padding: 3rem 0 1.5rem;
      margin-top: auto;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 3rem;
      margin-bottom: 2.5rem;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      color: var(--text-main);
      margin-bottom: 0.75rem;
    }

    .footer-desc {
      line-height: 1.6;
    }

    .disclaimer-title {
      font-size: 0.95rem;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .disclaimer-text {
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .helpline-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      background: var(--bg-main);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
      font-size: 0.85rem;
    }

    .helpline-box strong {
      color: var(--primary);
    }

    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-light);
      font-size: 0.825rem;
    }

    .bottom-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .bottom-links a {
      color: var(--text-muted);
    }

    .bottom-links a:hover {
      color: var(--primary);
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 0.75rem;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
