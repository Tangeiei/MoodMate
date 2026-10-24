import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'MoodMate — หน้าแรก',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'register',
    title: 'สมัครสมาชิก — MoodMate',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'login',
    title: 'เข้าสู่ระบบ — MoodMate',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    title: 'แดชบอร์ด — MoodMate',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'mood-checkin',
    title: 'บันทึกอารมณ์ — MoodMate',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mood-checkin/mood-checkin.component').then(m => m.MoodCheckinComponent)
  },
  {
    path: 'mood-history',
    title: 'ประวัติอารมณ์ — MoodMate',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mood-history/mood-history.component').then(m => m.MoodHistoryComponent)
  },
  {
    path: 'analytics',
    title: 'สถิติและแนวโน้ม — MoodMate',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'activities',
    title: 'กิจกรรมดูแลใจ — MoodMate',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/activities/activities.component').then(m => m.ActivitiesComponent)
  },
  {
    path: 'profile',
    title: 'ข้อมูลส่วนตัวและนโยบาย — MoodMate',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
