import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">
          <span class="brand-icon">🌱</span>
          <span class="brand-name">Mood<span class="brand-accent">Mate</span></span>
        </a>

        <!-- Mobile Toggle Button -->
        <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Navigation Links -->
        <nav class="nav-menu" [class.open]="isMenuOpen">
          <ng-container *ngIf="authService.isAuthenticated(); else guestLinks">
            <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">แดชบอร์ด</a>
            <a routerLink="/mood-checkin" routerLinkActive="active" (click)="closeMenu()">บันทึกอารมณ์</a>
            <a routerLink="/mood-history" routerLinkActive="active" (click)="closeMenu()">ประวัติ</a>
            <a routerLink="/analytics" routerLinkActive="active" (click)="closeMenu()">สถิติ</a>
            <a routerLink="/activities" routerLinkActive="active" (click)="closeMenu()">กิจกรรมดูแลใจ</a>
            <a routerLink="/profile" routerLinkActive="active" (click)="closeMenu()">โปรไฟล์</a>

            <div class="user-action">
              <span class="user-greeting">สวัสดี, {{ authService.currentUser()?.display_name }}</span>
              <button class="btn btn-outline btn-sm logout-btn" (click)="logout()">ออกจากระบบ</button>
            </div>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">หน้าแรก</a>
            <div class="auth-buttons">
              <a routerLink="/login" class="btn btn-outline btn-sm" (click)="closeMenu()">เข้าสู่ระบบ</a>
              <a routerLink="/register" class="btn btn-primary btn-sm" (click)="closeMenu()">สมัครสมาชิก</a>
            </div>
          </ng-template>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-light);
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0.75rem 0;
      box-shadow: var(--shadow-sm);
    }

    .nav-container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
      text-decoration: none;
    }

    .brand-icon {
      font-size: 1.5rem;
    }

    .brand-accent {
      color: var(--primary);
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .nav-menu a {
      font-size: 0.925rem;
      font-weight: 500;
      color: var(--text-body);
      padding: 0.4rem 0.65rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
    }

    .nav-menu a:hover {
      color: var(--primary);
      background: var(--primary-light);
    }

    .nav-menu a.active {
      color: var(--primary);
      background: var(--primary-light);
      font-weight: 600;
    }

    .user-action {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-left: 0.75rem;
      padding-left: 0.75rem;
      border-left: 1px solid var(--border-light);
    }

    .user-greeting {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
    }

    .mobile-toggle span {
      width: 22px;
      height: 2px;
      background-color: var(--text-main);
      border-radius: 2px;
      transition: all 0.2s ease;
    }

    @media (max-width: 868px) {
      .mobile-toggle {
        display: flex;
      }

      .nav-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border-bottom: 1px solid var(--border-light);
        box-shadow: var(--shadow-md);
        flex-direction: column;
        align-items: stretch;
        padding: 1rem 1.5rem 1.5rem;
        gap: 0.5rem;
      }

      .nav-menu.open {
        display: flex;
      }

      .user-action {
        border-left: none;
        border-top: 1px solid var(--border-light);
        padding-left: 0;
        padding-top: 1rem;
        margin-left: 0;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class NavbarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  public isMenuOpen = false;

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
  }

  public logout(): void {
    this.closeMenu();
    this.authService.logout();
  }
}
