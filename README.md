# 🌱 MoodMate — เว็บติดตามอารมณ์และดูแลสุขภาพใจสำหรับนักศึกษา
> **Student Mood Tracking Web Application**

MoodMate คือเว็บแอปพลิเคชันที่ออกแบบมาเพื่อให้นักศึกษาได้มีพื้นที่ปลอดภัยในการบันทึกอารมณ์ประจำวัน สำรวจปัจจัยที่ส่งผลต่อสุขภาพใจ ติดตามสถิติแนวโน้ม และผ่อนคลายด้วยกิจกรรม Self-care เบื้องต้น

---

## 📑 สารบัญ
1. [เทคโนโลยีที่ใช้ (Tech Stack)](#1-เทคโนโลยีที่ใช้-tech-stack)
2. [เครื่องมือที่ต้องติดตั้งบน Windows](#2-เครื่องมือที่ต้องติดตั้งบน-windows)
3. [การตั้งค่า Environment Variables](#3-การตั้งค่า-environment-variables)
4. [วิธีการรันระบบด้วย Docker Compose](#4-วิธีการรันระบบด้วย-docker-compose)
5. [การทดสอบระบบ (Automated Tests)](#5-การทดสอบระบบ-automated-tests)
6. [การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)](#6-การสำรองและกู้คืนฐานข้อมูล-backup--restore)
7. [ขั้นตอนการนำโค้ดขึ้น GitHub](#7-ขั้นตอนการนำโค้ดขึ้น-github)
8. [แนวทางการ Deploy สู่สาธารณะ (Free First)](#8-แนวทางการ-deploy-สู่สาธารณะ-free-first)
9. [ข้อจำกัดของบริการฟรีที่ต้องทราบ](#9-ข้อจำกัดของบริการฟรีที่ต้องทราบ)
10. [ความปลอดภัยและความเป็นส่วนตัว](#10-ความปลอดภัยและความเป็นส่วนตัว)

---

## 1. เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:**
  - Angular 22 (TypeScript, Component-based Architecture, Signals)
  - Angular Router (SPA Navigation พร้อม Route Guards)
  - Reactive Forms (การตรวจสอบและจัดการฟอร์ม)
  - Angular HttpClient (เชื่อมต่อ API ผ่าน Functional Interceptor)
  - SCSS (การออกแบบ Modern Pastel UI สไตล์คลีน สงบ สบายตา)
  - Chart.js (การแสดงผลกราฟแนวโน้ม 7 วัน และสัดส่วนอารมณ์)
- **Backend:**
  - Node-RED (RESTful API แยก Flow ชัดเจน 5 หมวดหมู่)
  - Node.js (v24 LTS)
  - `mysql2` (Prepared Statements ป้องกัน SQL Injection 100%)
  - `bcryptjs` (Password Hashing ด้วย Salt 10 รอบ)
  - `jsonwebtoken` (JWT Bearer Authentication)
- **Database:**
  - MySQL 8.0 Community Edition (Character set `utf8mb4` รองรับภาษาไทยและ Emoji)
  - Relational Schema พร้อม Foreign Keys แบบ Cascade Deletion และ Indexes
- **DevOps & Container:**
  - Docker & Docker Compose
  - Nginx (Web Server ให้บริการ Frontend และทำ Reverse Proxy `/api/`)
  - Docker Persistent Volumes สำหรับจัดเก็บข้อมูล MySQL ถาวร

---

## 2. เครื่องมือที่ต้องติดตั้งบน Windows

ก่อนเริ่มต้นใช้งานในเครื่องพัฒนา (Local Development) ให้ติดตั้งโปรแกรมดังนี้:
1. **Docker Desktop for Windows:** [ดาวน์โหลดที่นี่](https://www.docker.com/products/docker-desktop/) (เปิดใช้งาน WSL 2 Backend)
2. **Node.js (v22 หรือ v24 LTS):** [ดาวน์โหลดที่นี่](https://nodejs.org/) (สำหรับรันสคริปต์ทดสอบและ Angular CLI)
3. **Git for Windows:** [ดาวน์โหลดที่นี่](https://git-scm.com/)

---

## 3. การตั้งค่า Environment Variables

1. คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
   ```powershell
   copy .env.example .env
   ```
2. เปิดไฟล์ `.env` เพื่อตรวจสอบหรือปรับแต่งค่า:
   ```env
   # MySQL Database Configuration
   MYSQL_ROOT_PASSWORD=moodmate_root_secure_2025
   DB_NAME=moodmate_db
   DB_USER=moodmate_user
   DB_PASSWORD=moodmate_secure_pass_2025

   # JWT Secret Key (สำหรับ Production แนะนำให้เปลี่ยนเป็นสตริงสุ่มความยาว 32 ตัวอักษรขึ้นไป)
   JWT_SECRET=moodmate_jwt_secret_student_2025_secure_key_32chars

   # Node-RED Visual Editor Control (ตั้งค่า 'false' เพื่อความปลอดภัย ไม่ให้บุคคลภายนอกเข้าถึง Editor)
   NODE_RED_ENABLE_EDITOR=false
   ```

---

## 4. วิธีการรันระบบด้วย Docker Compose

เมื่อเปิด Docker Desktop เรียบร้อยแล้ว ให้เปิด Terminal ในโฟลเดอร์โปรเจกต์ `d:\MoodMate` แล้วสั่ง:

```powershell
# 1. ตรวจสอบความถูกต้องของ Compose configuration
docker compose config

# 2. สั่ง Build และรันทั้ง 3 บริการในเบื้องหลัง
docker compose up --build -d

# 3. ตรวจสอบสถานะของ Container
docker compose ps

# 4. ดู Logs การทำงานแบบ Realtime
docker compose logs -f
```

### พอร์ตการเข้าใช้งาน:
- **หน้าเว็บ MoodMate (Frontend):** [http://localhost:8080](http://localhost:8080)
- **REST API (ผ่าน Reverse Proxy):** [http://localhost:8080/api](http://localhost:8080/api)
- **Node-RED Backend (เข้าตรง):** [http://localhost:1880/api](http://localhost:1880/api)

เมื่อต้องการหยุดการทำงาน:
```powershell
docker compose down
```

---

## 5. การทดสอบระบบ (Automated Tests)

โปรเจกต์มาพร้อมกับชุดทดสอบอัตโนมัติครอบคลุม 21 สถานการณ์ (Authentication, ป้องกันอีเมลซ้ำ, ป้องกันบันทึกวันเดียวกันซ้ำ, สิทธิ์การแยกข้อมูล User A/B, Analytics, กิจกรรม Self-care, และการลบบัญชีแบบ Cascade):

```powershell
node scripts/test-suite.js
```

**ผลการทดสอบจริง:**
```
====================================================
   MoodMate Full-Stack Test Suite
====================================================
  [PASS] Register User A with valid data
  [PASS] Prevent duplicate email registration (409 Conflict)
  [PASS] Register User B successfully
  [PASS] Login with correct credentials
  [PASS] Reject login with invalid credentials (401)
  [PASS] Deny unauthenticated request without token (401)
  [PASS] Verify GET /auth/me returns User A details
  [PASS] Create Mood Entry with score 4 and factors
  [PASS] Prevent duplicate check-in on the same date (409)
  [PASS] User B CANNOT read User A entry (Returns 404 Not Found)
  [PASS] User B CANNOT modify User A entry (Returns 404 Not Found)
  [PASS] User A reads own entry with details
  [PASS] User A updates own mood entry to score 5
  [PASS] Analytics calculates average mood score correctly
  [PASS] Fetch master list of self-care activities
  [PASS] Complete activity #1 (4-7-8 Breathing)
  [PASS] Retrieve activity completion history
  [PASS] Get User Profile with stats
  [PASS] Update user display name
  [PASS] Delete User B account and cascade all data
  [PASS] Deleted user cannot log in anymore
====================================================
Test Execution Finished: 21 PASSED, 0 FAILED
====================================================
```

---

## 6. การสำรองและกู้คืนฐานข้อมูล (Backup & Restore)

### สำหรับระบบปฏิบัติการ Windows:
- **สำรองข้อมูล (Backup):**
  ดับเบิลคลิกไฟล์ `scripts\backup-db.bat` หรือรันผ่าน PowerShell:
  ```powershell
  .\scripts\backup-db.bat
  ```
  ไฟล์ SQL Dump จะถูกสร้างขึ้นในโฟลเดอร์ `backup\moodmate_backup_YYYY-MM-DD_HH-mm-ss.sql`

- **กู้คืนข้อมูล (Restore):**
  ```powershell
  .\scripts\restore-db.bat backup\moodmate_backup_2026-10-24_15-30-00.sql
  ```

### สำหรับระบบปฏิบัติการ Linux / Cloud VM:
```bash
# Backup
chmod +x scripts/backup-db.sh scripts/restore-db.sh
./scripts/backup-db.sh

# Restore
./scripts/restore-db.sh backup/your_backup_file.sql
```

---

## 7. ขั้นตอนการนำโค้ดขึ้น GitHub

1. สร้าง Repository ใหม่บน [GitHub](https://github.com/new) ตั้งชื่อ เช่น `moodmate-app` (แนะนำให้เลือกเป็น Private หรือ Public ตามต้องการ)
2. รันคำสั่ง Git ในโฟลเดอร์โปรเจกต์:
   ```powershell
   # เริ่มต้น Git
   git init

   # ตรวจสอบสถานะ (ไฟล์ .env, node_modules, dist จะถูก ignore โดยอัตโนมัติ)
   git status

   # เพิ่มไฟล์ทั้งหมด
   git add .

   # บันทึก Commit แรก
   git commit -m "feat: complete MoodMate full-stack system with Angular, Node-RED, MySQL, and Docker"

   # เชื่อมโยงกับ Remote Repository ของคุณ
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/moodmate-app.git

   # Push โค้ดขึ้น GitHub
   git push -u origin main
   ```

---

## 8. แนวทางการ Deploy สู่สาธารณะ (Free First)

เพื่อให้สามารถส่งงานให้อาจารย์หรือบุคคลภายนอกทดสอบผ่าน URL สาธารณะได้ฟรีโดยไม่ต้องเปิดคอมพิวเตอร์ทิ้งไว้:

### ส่วนที่ 1: Frontend (Static Hosting ฟรี 100%)
สามารถเลือกใช้ **GitHub Pages**, **Vercel** หรือ **Cloudflare Pages**:
1. **GitHub Pages:**
   - ทำการ Build Angular โดยกำหนด Base Href ให้ตรงกับชื่อ Repo:
     ```powershell
     cd frontend
     npm run build -- --configuration production --base-href /moodmate-app/
     ```
   - คัดลอกไฟล์ `index.html` ไปเป็น `404.html` ในโฟลเดอร์ `dist/frontend/browser` (เพื่อแก้ปัญหา SPA Routing เมื่อ Refresh หน้า)
   - ใช้ GitHub Actions Workflow (มี template พร้อมใน GitHub Pages Settings) เพื่อ deploy โฟลเดอร์ `dist/frontend/browser` อัตโนมัติ

2. **การชี้ API URL:**
   - ใน `frontend/src/environments/environment.prod.ts` ให้ระบุ URL ของ Backend ที่ Deploy แล้ว เช่น:
     ```typescript
     export const environment = {
       production: true,
       apiUrl: 'https://moodmate-backend.your-domain.com/api'
     };
     ```

### ส่วนที่ 2: Backend + MySQL (Container Hosting ฟรี)
เลือกตัวเลือกฟรีที่รองรับ Docker และ Persistent Storage:
- **ตัวเลือกที่ 1 (แนะนำที่สุด): Oracle Cloud Free Tier (Always Free Compute VM)**
  - ได้สิทธิ์ฟรีตลอดชีพ: VM AMD หรือ ARM 4 OCPU, RAM สูงสุด 24 GB, และ Storage ฟรี 200 GB
  - ติดตั้ง Docker & Docker Compose บน VM จากนั้น Git Clone โปรเจกต์ลงไป
  - รัน `docker compose up -d`
  - ติดตั้ง Caddy หรือ Nginx เพื่อทำ Reverse Proxy และออกใบรับรอง HTTPS ฟรีผ่าน Let's Encrypt อัตโนมัติ
- **ตัวเลือกที่ 2: Render.com / Railway / Fly.io (Free Tier)**
  - Deploy Node-RED Backend และ MySQL Service บน Docker
  - รองรับการตั้งค่า Environment Variables ผ่าน Web Dashboard

---

## 9. ข้อจำกัดของบริการฟรีที่ต้องทราบ

1. **GitHub Pages:** รองรับเฉพาะ Static File (HTML/CSS/JS) เท่านั้น **ไม่สามารถรัน Node-RED หรือ MySQL ได้** และเมื่อ Refresh หน้าย่อย (เช่น `/dashboard`) บน Single Page Application ต้องมีไฟล์ `404.html` เพื่อ fallback กลับมาที่ `index.html`
2. **Free Cloud Instance Sleep / Cold Start:** หากใช้บริการ PaaS ฟรีบางราย (เช่น Render Free Tier) เมื่อไม่มี Request เข้ามาเกิน 15 นาที ระบบจะเข้าสู่โหมดหลับ (Sleep) ทำให้การเข้าครั้งแรกหลังจากนั้นอาจใช้เวลาโหลดประมาณ 30-50 วินาที
3. **ข้อจำกัดฐานข้อมูล:** ในบริการฟรีบางแห่ง ฐานข้อมูลอาจจำกัดขนาดความจุ (เช่น 256MB-1GB) ซึ่งเพียงพอสำหรับโปรเจกต์นักศึกษา แต่แนะนำให้รันสคริปต์สำรองข้อมูลอย่างสม่ำเสมอ

---

## 10. ความปลอดภัยและความเป็นส่วนตัว

- **การแยกสิทธิ์ข้อมูล (Strict Data Isolation):** ทุก Query ใน Node-RED อ้างอิงจาก `user_id` ที่ถอดรหัสจาก JWT Token ฝั่ง Server เท่านั้น ผู้ใช้ A ไม่สามารถอ่านหรือแก้ไขข้อมูลของผู้ใช้ B ได้
- **การจัดเก็บรหัสผ่าน:** ใช้ `bcryptjs` เข้ารหัสรหัสผ่านก่อนบันทึกลง MySQL เสมอ และไม่มีการบันทึกรหัสผ่านลงใน Log
- **การป้องกัน Editor:** Node-RED Editor ปิดการใช้งาน (`NODE_RED_ENABLE_EDITOR=false`) เพื่อป้องกันไม่ให้บุคคลภายนอกเปิดดู Flow หรือ Credential
- **สิทธิ์การลบข้อมูล:** ผู้ใช้สามารถกด "ลบบัญชีผู้ใช้" ได้ที่หน้า Profile โดยระบบจะใช้ Foreign Key Cascade ลบทั้งบันทึกอารมณ์และประวัติกิจกรรมทั้งหมดอย่างสมบูรณ์

---

*โปรเจกต์นี้พัฒนาขึ้นเพื่อการศึกษาและการดูแลสุขภาพใจเบื้องต้น มิใช่บริการทางการแพทย์*
