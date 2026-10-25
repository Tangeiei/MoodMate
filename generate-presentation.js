const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();

// Configure 16:9 widescreen layout
pres.layout = 'LAYOUT_16x9';
pres.author = 'MoodMate Project Team';
pres.company = 'Computer Science / Software Engineering';
pres.title = 'MoodMate - Student Mood Tracking Web Application';
pres.subject = 'Project Presentation & System Walkthrough';

// Color Palette (Calm & Modern Pastel Theme)
const C_BG = 'F8FAFC';          // Soft slate bg
const C_WHITE = 'FFFFFF';       // Pure white card
const C_PRIMARY = '4A6FA5';     // Primary soft blue
const C_PRIMARY_DARK = '2C3E50';// Dark navy text
const C_PRIMARY_LIGHT = 'E8EFF9'; // Pill / accent bg
const C_ACCENT_GREEN = '4E9A78';
const C_TEXT_MAIN = '334155';   // Slate 700
const C_TEXT_MUTED = '64748B';  // Slate 500
const C_BORDER = 'E2E8F0';

const FONT_TITLE = 'Prompt';
const FONT_BODY = 'Prompt';

const imgDir = path.join(__dirname, 'presentation', 'screenshots');

function applySlideBase(slide, tag, title) {
  slide.background = { color: C_BG };
  
  // Header tag
  slide.addText(tag.toUpperCase(), {
    x: 0.8, y: 0.45, w: 11.5, h: 0.3,
    fontSize: 10, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE,
    charSpacing: 2
  });

  // Header title
  slide.addText(title, {
    x: 0.8, y: 0.75, w: 11.5, h: 0.55,
    fontSize: 21, bold: true, color: C_PRIMARY_DARK, fontFace: FONT_TITLE
  });

  // Top header divider line
  slide.addShape(pres.ShapeType.line, {
    x: 0.8, y: 1.35, w: 11.733, h: 0,
    line: { color: 'CBD5E1', width: 1 }
  });

  // Footer bar
  slide.addText('MoodMate — Student Mood Tracking Web Application | Demo Presentation', {
    x: 0.8, y: 7.05, w: 9.0, h: 0.3,
    fontSize: 9, color: C_TEXT_MUTED, fontFace: FONT_BODY
  });
}

// ==========================================
// SLIDE 1: Title & Hero Cover
// ==========================================
const s1 = pres.addSlide();
s1.background = { color: '0F172A' }; // Dark modern hero theme

// Title & Subtitle Left side
s1.addText('🌱 💙 ✨', {
  x: 1.0, y: 1.2, w: 5.5, h: 0.6, fontSize: 32
});

s1.addText('MoodMate', {
  x: 1.0, y: 1.8, w: 5.8, h: 1.1,
  fontSize: 48, bold: true, color: '60A5FA', fontFace: FONT_TITLE
});

s1.addText('Student Mood Tracking Web Application\nเว็บแอปพลิเคชันบันทึกและวิเคราะห์สุขภาพอารมณ์สำหรับนักศึกษา', {
  x: 1.0, y: 2.9, w: 5.8, h: 1.1,
  fontSize: 16, color: 'E2E8F0', fontFace: FONT_BODY, lineSpacingMultiple: 1.3
});

s1.addText([
  { text: '• Full-Stack Architecture: ', options: { bold: true, color: '93C5FD' } },
  { text: 'Angular 22 + Node-RED + MySQL 8.0\n' },
  { text: '• Containerized: ', options: { bold: true, color: '93C5FD' } },
  { text: 'Docker Compose พร้อมใช้งานทุกแพลตฟอร์ม\n' },
  { text: '• Automated QA: ', options: { bold: true, color: '93C5FD' } },
  { text: 'ผ่านการทดสอบ 21/21 Test Cases 100%' }
], {
  x: 1.0, y: 4.1, w: 5.8, h: 1.4,
  fontSize: 13, color: '94A3B8', fontFace: FONT_BODY, lineSpacingMultiple: 1.3
});

// Tech Badges on Hero
s1.addShape(pres.ShapeType.roundRect, {
  x: 1.0, y: 5.7, w: 5.8, h: 0.75, rectRadius: 0.1,
  fill: { color: '1E293B' }, line: { color: '334155', width: 1 }
});
s1.addText('Angular 22  •  Chart.js  •  Node-RED  •  MySQL 8.0  •  Docker', {
  x: 1.0, y: 5.7, w: 5.8, h: 0.75,
  fontSize: 12, bold: true, color: '38BDF8', align: 'center', valign: 'middle', fontFace: FONT_TITLE
});

// Hero Image Preview (Landing Page Screenshot)
const landingImg = path.join(imgDir, '00_landing.png');
if (fs.existsSync(landingImg)) {
  s1.addImage({
    path: landingImg,
    x: 7.1, y: 1.2, w: 5.5, h: 5.3,
    sizing: { type: 'contain' }
  });
}

// ==========================================
// SLIDE 2: Problem & Motivation
// ==========================================
const s2 = pres.addSlide();
applySlideBase(s2, '01 / Background & Motivation', 'ที่มาและความสำคัญของปัญหา (Problem Statement)');

// Left Card - Problems
s2.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 5.6, h: 3.6, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: 'FCA5A5', width: 1.5 }
});
s2.addText('⚠️ ปัญหาด้านสุขภาพใจในชีวิตมหาวิทยาลัย', {
  x: 1.1, y: 1.8, w: 5.0, h: 0.45,
  fontSize: 16, bold: true, color: 'DC2626', fontFace: FONT_TITLE
});
s2.addText([
  { text: '• ภาวะความเครียดสะสม:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   นักศึกษาเผชิญแรงกดดันจากการเรียน สอบ งานกลุ่ม และการปรับตัว\n\n' },
  { text: '• ขาดการรู้เท่าทันอารมณ์ตนเอง:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ไม่ทราบว่าช่วงเวลาใดที่ความเครียดสูง จนนำไปสู่อาการ Burnout หรือซึมเศร้า\n\n' },
  { text: '• ขาดเครื่องมือติดตามที่เข้าถึงง่าย:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   แอปพลิเคชันทั่วไปซับซ้อน หรือมีค่าใช้จ่าย และไม่ตอบโจทย์นักศึกษา' }
], {
  x: 1.1, y: 2.3, w: 5.0, h: 2.7,
  fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.2
});

// Right Card - Solution (MoodMate)
s2.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.6, w: 5.7, h: 3.6, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: '93C5FD', width: 1.5 }
});
s2.addText('🌱 โซลูชัน: MoodMate Web Application', {
  x: 7.1, y: 1.8, w: 5.1, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s2.addText([
  { text: '• บันทึกอารมณ์ประจำวันง่ายใน 1 นาที:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   เลือกคะแนนอารมณ์ 5 ระดับ ระบุปัจจัยต้นเหตุ และชั่วโมงการนอน\n\n' },
  { text: '• สถิติและการวิเคราะห์เชิงลึก:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   เห็นความสัมพันธ์ระหว่างการนอน พลังงาน และอารมณ์ผ่านกราฟทันที\n\n' },
  { text: '• แนะนำกิจกรรมดูแลใจ (Self-Care):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ระบบแนะนำแบบฝึกหายใจและกิจกรรมผ่อนคลายที่เหมาะกับสภาพจิตใจ' }
], {
  x: 7.1, y: 2.3, w: 5.1, h: 2.7,
  fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.2
});

// Bottom Goal Banner
s2.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 5.4, w: 11.7, h: 1.3, rectRadius: 0.12,
  fill: { color: C_PRIMARY_LIGHT }, line: { color: 'BFDBFE', width: 1 }
});
s2.addText('🎯 เป้าหมายสูงสุด: ส่งเสริมสุขภาวะทางอารมณ์ที่ดี (Emotional Well-being) ให้นักศึกษาสามารถเข้าถึงเครื่องมือดูแลตนเองได้ทุกที่ ทุกเวลา อย่างเป็นส่วนตัว ปลอดภัย และไร้ค่าใช้จ่าย', {
  x: 1.1, y: 5.55, w: 11.1, h: 1.0,
  fontSize: 14, bold: true, color: '1E3A8A', fontFace: FONT_TITLE, lineSpacingMultiple: 1.3
});

// ==========================================
// SLIDE 3: System Architecture
// ==========================================
const s3 = pres.addSlide();
applySlideBase(s3, '02 / Technical Architecture', 'สถาปัตยกรรมระบบและเทคโนโลยี (System Architecture)');

// 3 Columns: Frontend / Backend / Database
const archCols = [
  {
    x: 0.8, tag: 'FRONTEND TIER', title: '🅰️ Angular 22 & Nginx', color: '2563EB',
    items: [
      'Single Page Application (SPA)',
      'Angular Signals & Standalone Components',
      'SCSS Responsive Theme (Desktop & Mobile)',
      'Chart.js โต้ตอบแสดงผลสถิติแบบ Real-time',
      'Nginx Container ให้บริการ Production Build'
    ]
  },
  {
    x: 4.8, tag: 'BACKEND API TIER', title: '🔴 Node-RED Flow Engine', color: 'DC2626',
    items: [
      'Flow-based Visual API Architecture',
      'RESTful Endpoints: /api/auth, /api/moods',
      'bcryptjs เข้ารหัสผ่าน Password Salt 10 รอบ',
      'jsonwebtoken (JWT) ตรวจสอบสิทธิ์ทุก Request',
      'mysql2 Connection Pool ป้องกัน Latency'
    ]
  },
  {
    x: 8.8, tag: 'DATABASE & DEVOPS', title: '🐬 MySQL 8.0 & Docker', color: '059669',
    items: [
      'Relational Schema แยกตาราง Users/Moods',
      'Foreign Key & ON DELETE CASCADE',
      'Docker Persistent Volume รักษาข้อมูลถาวร',
      'Docker Compose สั่งรันทั้งระบบในคำสั่งเดียว',
      'Cloudflare Tunnel เข้าทดสอบผ่านสมาร์ตโฟน'
    ]
  }
];

archCols.forEach(col => {
  s3.addShape(pres.ShapeType.roundRect, {
    x: col.x, y: 1.6, w: 3.7, h: 4.2, rectRadius: 0.12,
    fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
  });
  s3.addText(col.tag, {
    x: col.x + 0.3, y: 1.8, w: 3.1, h: 0.25,
    fontSize: 10, bold: true, color: col.color, fontFace: FONT_TITLE
  });
  s3.addText(col.title, {
    x: col.x + 0.3, y: 2.1, w: 3.1, h: 0.45,
    fontSize: 15, bold: true, color: C_PRIMARY_DARK, fontFace: FONT_TITLE
  });
  s3.addText(col.items.map(it => `• ${it}\n\n`).join(''), {
    x: col.x + 0.3, y: 2.65, w: 3.1, h: 3.0,
    fontSize: 12, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });
});

// Architecture Pipeline Summary Banner
s3.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 6.0, w: 11.7, h: 0.8, rectRadius: 0.1,
  fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 }
});
s3.addText('Client Browser / Mobile  ⇆  Nginx Proxy (:8080)  ⇆  Node-RED Engine (:1880)  ⇆  MySQL Database (:3306)', {
  x: 0.8, y: 6.0, w: 11.7, h: 0.8,
  fontSize: 13, bold: true, color: C_PRIMARY_DARK, align: 'center', valign: 'middle', fontFace: FONT_TITLE
});

// ==========================================
// SLIDE 4: Screen 1 - Authentication & Registration
// ==========================================
const s4 = pres.addSlide();
applySlideBase(s4, '03 / Screen Walkthrough', 'ระบบสมัครสมาชิกและยืนยันตัวตน (Authentication)');

// Left: Screenshot of Login
const loginImg = path.join(imgDir, '01_login.png');
if (fs.existsSync(loginImg)) {
  s4.addImage({
    path: loginImg,
    x: 0.8, y: 1.6, w: 6.2, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// Right: Details Card
s4.addShape(pres.ShapeType.roundRect, {
  x: 7.3, y: 1.6, w: 5.2, h: 5.1, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
});

s4.addText('🔐 การรักษาความปลอดภัยบัญชีผู้ใช้', {
  x: 7.6, y: 1.9, w: 4.6, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s4.addText([
  { text: '• แยกข้อมูลรายบุคคล 100% (User Data Isolation):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ผู้ใช้แต่ละคนมองเห็นเฉพาะบันทึกของตนเอง ไม่สามารถดูของคนอื่นได้\n\n' },
  { text: '• การเข้ารหัสผ่าน (Password Hashing):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ใช้ bcryptjs พร้อม Salt Rounds 10 ในการเข้ารหัสก่อนบันทึก ไม่มีการเก็บ Plain-text\n\n' },
  { text: '• ระบบ JSON Web Token (JWT):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ออก Token อายุ 7 วัน จัดเก็บใน LocalStorage พร้อม Header Authorization ตรวจสอบสิทธิ์ทุก API\n\n' },
  { text: '• การตรวจสอบอีเมลซ้ำ (Duplicate Prevention):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ระบบปฏิเสธการลงทะเบียนอีเมลซ้ำพร้อมแจ้งเตือนผู้ใช้งาน' }
], {
  x: 7.6, y: 2.45, w: 4.6, h: 4.0,
  fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// ==========================================
// SLIDE 5: Screen 2 - Dashboard Overview
// ==========================================
const s5 = pres.addSlide();
applySlideBase(s5, '04 / Screen Walkthrough', 'แดชบอร์ดสรุปผลสุขภาพใจประจำวัน (Student Dashboard)');

// Left: Screenshot of Dashboard
const dashImg = path.join(imgDir, '02_dashboard.png');
if (fs.existsSync(dashImg)) {
  s5.addImage({
    path: dashImg,
    x: 0.8, y: 1.6, w: 6.2, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// Right: Details Card
s5.addShape(pres.ShapeType.roundRect, {
  x: 7.3, y: 1.6, w: 5.2, h: 5.1, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
});

s5.addText('📊 ฟังก์ชันเด่นบนหน้าแดชบอร์ด', {
  x: 7.6, y: 1.9, w: 4.6, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s5.addText([
  { text: '• การทักทายแบบ Personalized Greeting:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   แสดงชื่อนักศึกษา ข้อความสร้างแรงบันดาลใจ และสถิติ Streak วันที่บันทึกต่อเนื่อง\n\n' },
  { text: '• สถานะการเช็คอินวันนี้ (Today Mood Status):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   บอกสถานะชัดเจนว่าวันนี้บันทึกอารมณ์แล้วหรือยัง พร้อมปุ่มกดบันทึกทันที\n\n' },
  { text: '• Quick Summary Metrics:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   แสดงคะแนนอารมณ์เฉลี่ยประจำสัปดาห์, ชั่วโมงการนอนเฉลี่ย, และระดับพลังงาน\n\n' },
  { text: '• การดึงข้อมูลอัตโนมัติ (RxJS forkJoin):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   โหลดข้อมูลแดชบอร์ดและสถิติพร้อมกันแบบ Asynchronous ปราศจากปัญหาค้าง' }
], {
  x: 7.6, y: 2.45, w: 4.6, h: 4.0,
  fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// ==========================================
// SLIDE 6: Screen 3 - Mood Check-in Flow
// ==========================================
const s6 = pres.addSlide();
applySlideBase(s6, '05 / Screen Walkthrough', 'ระบบเช็คอินและบันทึกอารมณ์ (Daily Mood Check-in)');

// Left: Screenshot of Check-in
const checkinImg = path.join(imgDir, '03_checkin.png');
if (fs.existsSync(checkinImg)) {
  s6.addImage({
    path: checkinImg,
    x: 0.8, y: 1.6, w: 6.2, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// Right: Details Card
s6.addShape(pres.ShapeType.roundRect, {
  x: 7.3, y: 1.6, w: 5.2, h: 5.1, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
});

s6.addText('📝 ขั้นตอนการบันทึกอารมณ์', {
  x: 7.6, y: 1.9, w: 4.6, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s6.addText([
  { text: '1. เลือกคะแนนอารมณ์ 5 ระดับ:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   มีความสุขมาก (5), สงบ/ดี (4), ปกติ (3), เศร้า/เหนื่อย (2), เครียด/กังวล (1)\n\n' },
  { text: '2. ระบุปัจจัยต้นเหตุ (Influencing Factors):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   การเรียน, สอบ, เพื่อน, แฟน, ครอบครัว, การเงิน, หรือสุขภาพ\n\n' },
  { text: '3. บันทึกระดับพลังงาน & การนอนหลับ:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ระบุชั่วโมงการนอน (0-24 ชม.) และ Energy Level (1-5) เพื่อดูความสัมพันธ์\n\n' },
  { text: '4. ไดอารี่ระบายความรู้สึก (Personal Note):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   พิมพ์บันทึกสิ่งดีๆ หรือเรื่องที่กังวลใจ เพื่อปลดปล่อยความรู้สึก' }
], {
  x: 7.6, y: 2.45, w: 4.6, h: 4.0,
  fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// ==========================================
// SLIDE 7: Screen 4 - Analytics & Insights
// ==========================================
const s7 = pres.addSlide();
applySlideBase(s7, '06 / Screen Walkthrough', 'การวิเคราะห์และแสดงผลสถิติแนวโน้ม (Mood Analytics & Insights)');

// Left: Screenshot of Analytics
const analyticsImg = path.join(imgDir, '04_analytics.png');
if (fs.existsSync(analyticsImg)) {
  s7.addImage({
    path: analyticsImg,
    x: 0.8, y: 1.6, w: 6.2, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// Right: Details Card
s7.addShape(pres.ShapeType.roundRect, {
  x: 7.3, y: 1.6, w: 5.2, h: 5.1, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
});

s7.addText('📈 การประมวลผลข้อมูลสถิติสุขภาพใจ', {
  x: 7.6, y: 1.9, w: 4.6, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s7.addText([
  { text: '• Mood Trend Line Chart:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   กราฟเส้นแสดงคะแนนอารมณ์ย้อนหลัง 7 วัน และ 30 วัน ช่วยให้สังเกต Pattern ความเครียดได้ทันที\n\n' },
  { text: '• Mood Distribution Doughnut Chart:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   แผนภูมิโดนัทแสดงสัดส่วนอารมณ์ประเภทต่างๆ คิดเป็นเปอร์เซ็นต์อย่างชัดเจน\n\n' },
  { text: '• Sleep & Energy Correlation:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   คำนวณเปรียบเทียบชั่วโมงการนอนกับคะแนนอารมณ์ เพื่อให้เห็นความสำคัญของการพักผ่อน\n\n' },
  { text: '• ตัวกรองช่วงเวลา (Time Filter):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   เลือกดูข้อมูลย้อนหลัง 7 วัน, 30 วัน หรือทั้งหมดได้อย่างยืดหยุ่น' }
], {
  x: 7.6, y: 2.45, w: 4.6, h: 4.0,
  fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// ==========================================
// SLIDE 8: Screen 5 - Mood History & Activities
// ==========================================
const s8 = pres.addSlide();
applySlideBase(s8, '07 / Screen Walkthrough', 'ประวัติอารมณ์ย้อนหลังและกิจกรรมดูแลใจ (History & Self-Care)');

// Left: Screenshot of History
const historyImg = path.join(imgDir, '05_history.png');
if (fs.existsSync(historyImg)) {
  s8.addImage({
    path: historyImg,
    x: 0.8, y: 1.6, w: 5.7, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// Right: Screenshot of Activities
const activitiesImg = path.join(imgDir, '06_activities.png');
if (fs.existsSync(activitiesImg)) {
  s8.addImage({
    path: activitiesImg,
    x: 6.8, y: 1.6, w: 5.7, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// ==========================================
// SLIDE 9: Screen 6 - Mobile Responsiveness & Testing
// ==========================================
const s9 = pres.addSlide();
applySlideBase(s9, '08 / Verification & Access', 'การทดสอบระบบและการใช้งานบนมือถือ (Mobile View & QA)');

// Left: Mobile View Screenshot
const mobileImg = path.join(imgDir, '07_mobile_view.png');
if (fs.existsSync(mobileImg)) {
  s9.addImage({
    path: mobileImg,
    x: 1.2, y: 1.6, w: 3.5, h: 5.1,
    sizing: { type: 'contain' }
  });
}

// Right: Testing & Tunnel Info Card
s9.addShape(pres.ShapeType.roundRect, {
  x: 5.2, y: 1.6, w: 7.3, h: 5.1, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: C_BORDER, width: 1.5 }
});

s9.addText('📱 การเข้าถึงผ่านสมาร์ตโฟน & ความพร้อมใช้งาน', {
  x: 5.5, y: 1.9, w: 6.7, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s9.addText([
  { text: '• Mobile-First Responsive Design:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ออกแบบ UI ให้รองรับหน้าจอสมาร์ตโฟน ปุ่มกดง่าย ตัวหนังสือคมชัด และเมนู Bottom/Drawer\n\n' },
  { text: '• Cloudflare Live Tunnel (HTTPS):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   สร้างสคริปต์เปิด Tunnel เชื่อมต่อมือถือเข้ากับเครื่องเดโมได้ทันที โดยไม่ต้องตั้งค่า Router หรือเปิด Port\n\n' },
  { text: '• Automated Test Suite 21 / 21 Tests (100% Pass):\n', options: { bold: true, color: '059669' } },
  { text: '   - ทดสอบ Register, Duplicate Check, Login/Logout, Token Expiry\n' },
  { text: '   - ทดสอบ CRUD Mood Entries, Date Uniqueness Constraint\n' },
  { text: '   - ทดสอบ Cross-user Data Isolation (ผู้ใช้ A ห้ามแก้ข้อมูลผู้ใช้ B)\n' },
  { text: '   - ทดสอบ Cascade Account Deletion และ Persistence หลังรีสตาร์ต' }
], {
  x: 5.5, y: 2.45, w: 6.7, h: 4.0,
  fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// ==========================================
// SLIDE 10: Conclusion & Future Roadmap
// ==========================================
const s10 = pres.addSlide();
applySlideBase(s10, '09 / Conclusion & Future Roadmap', 'สรุปผลการดำเนินงานและแผนพัฒนาต่อยอด (Conclusion)');

// Left: Project Achievements
s10.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 5.6, h: 3.8, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: '86EFAC', width: 1.5 }
});
s10.addText('🏆 ความสำเร็จของโครงงาน (Achievements)', {
  x: 1.1, y: 1.85, w: 5.0, h: 0.45,
  fontSize: 16, bold: true, color: '059669', fontFace: FONT_TITLE
});
s10.addText([
  { text: '• ระบบทำงานได้จริงครบวงจร (End-to-End):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   Frontend, Backend REST API และ Database เชื่อมต่อเสถียร 100%\n\n' },
  { text: '• ประสบการณ์ใช้งานที่ลื่นไหล (UX/UI):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ออกแบบโทนสีอบอุ่น ลดความเครียด บันทึกง่ายภายใน 1 นาที\n\n' },
  { text: '• คุณภาพซอฟต์แวร์ระดับมืออาชีพ:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   มีชุดทดสอบอัตโนมัติ รันผ่าน Docker ได้ในคำสั่งเดียว และรองรับการใช้งานผ่านมือถือ' }
], {
  x: 1.1, y: 2.4, w: 5.0, h: 2.8,
  fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// Right: Future Roadmap
s10.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.6, w: 5.7, h: 3.8, rectRadius: 0.15,
  fill: { color: C_WHITE }, line: { color: '93C5FD', width: 1.5 }
});
s10.addText('🔮 แผนพัฒนาในอนาคต (Future Roadmap)', {
  x: 7.1, y: 1.85, w: 5.1, h: 0.45,
  fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s10.addText([
  { text: '• ระบบแจ้งเตือนรายวัน (Push Notification):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   แจ้งเตือนให้นักศึกษาเข้ามาเช็คอินอารมณ์ก่อนนอนเป็นประจำ\n\n' },
  { text: '• AI Mood Companion & Advice:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ใช้โมเดลปัญญาประดิษฐ์ให้กำลังใจและวิเคราะห์สภาวะจิตใจเชิงลึก\n\n' },
  { text: '• การส่งออกรายงานสรุปสุขภาพใจ (PDF Export):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   สร้างรายงานสรุปประวัติอารมณ์สำหรับปรึกษาอาจารย์หรือจิตแพทย์' }
], {
  x: 7.1, y: 2.4, w: 5.1, h: 2.8,
  fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25
});

// Thank You & Q&A Card
s10.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 5.6, w: 11.7, h: 1.15, rectRadius: 0.12,
  fill: { color: C_PRIMARY_LIGHT }, line: { color: 'BFDBFE', width: 1 }
});
s10.addText('ขอขอบพระคุณอาจารย์และคณะกรรมการทุกท่าน 🙏\nยินดีรับฟังข้อเสนอแนะและตอบข้อซักถาม (Q&A Session)', {
  x: 0.8, y: 5.6, w: 11.7, h: 1.15,
  fontSize: 15, bold: true, color: '1E3A8A', align: 'center', valign: 'middle', fontFace: FONT_TITLE
});

// Save PowerPoint Presentation
const outputDir = path.join(__dirname, 'presentation');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'MoodMate_Presentation.pptx');
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log('PowerPoint presentation with embedded UI screenshots generated at: ' + outputPath);
}).catch(err => {
  console.error('Error generating presentation:', err);
});
