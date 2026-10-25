/**
 * Script to generate MoodMate Presentation PowerPoint (.pptx)
 */
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();

// Set 16:9 Widescreen
pres.layout = 'LAYOUT_16x9';
pres.author = 'MoodMate Developer';
pres.company = 'Student Project';
pres.title = 'MoodMate - Student Mood Tracking Web Application';

// Theme Colors
const C_BG = 'F8FAFC';
const C_CARD = 'FFFFFF';
const C_PRIMARY = '4F46E5';
const C_PRIMARY_LIGHT = 'EEF2FF';
const C_SECONDARY = '0EA5E9';
const C_TEXT_MAIN = '0F172A';
const C_TEXT_MUTED = '64748B';
const C_BORDER = 'E2E8F0';
const C_GREEN = '10B981';
const C_ROSE = 'F43F5E';
const C_PURPLE = '8B5CF6';

const FONT_TITLE = 'Arial';
const FONT_BODY = 'Arial';

// Helper to create slide with background
function createSlide(titleText, categoryText = 'MOODMATE PROJECT PRESENTATION') {
  const slide = pres.addSlide();
  slide.background = { color: C_BG };

  // Category Tag
  slide.addText(categoryText.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C_PRIMARY,
    fontFace: FONT_TITLE
  });

  // Slide Title
  slide.addText(titleText, {
    x: 0.8,
    y: 0.65,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: C_TEXT_MAIN,
    fontFace: FONT_TITLE
  });

  // Footer
  slide.addText('MoodMate — Student Mood Tracking Web Application', {
    x: 0.8,
    y: 7.1,
    w: 8.0,
    h: 0.3,
    fontSize: 9,
    color: C_TEXT_MUTED,
    fontFace: FONT_BODY
  });

  return slide;
}

// -------------------------------------------------------------
// SLIDE 1: Title Slide
// -------------------------------------------------------------
const s1 = pres.addSlide();
s1.background = { color: 'EEF2FF' };

// Decorative shapes
s1.addShape(pres.ShapeType.rect, {
  x: 0.8, y: 1.5, w: 11.7, h: 4.5,
  fill: { color: 'FFFFFF' },
  line: { color: 'C7D2FE', width: 1.5 },
  shadow: { type: 'outer', blur: 6, offset: 3, angle: 45, opacity: 0.1 }
});

s1.addText('🌱 MOODMATE PROJECT', {
  x: 1.3, y: 1.9, w: 10.0, h: 0.4,
  fontSize: 14, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s1.addText('MoodMate — เว็บติดตามอารมณ์\nและดูแลสุขภาพใจสำหรับนักศึกษา', {
  x: 1.3, y: 2.3, w: 10.5, h: 1.5,
  fontSize: 32, bold: true, color: C_TEXT_MAIN, fontFace: FONT_TITLE, lineSpacingMultiple: 1.15
});

s1.addText('Student Mood Tracking & Mental Health Check-in Web Application\nระบบดูแลสุขภาพใจเบื้องต้น รองรับการใช้งานทั้งคอมพิวเตอร์และมือถือ 100%', {
  x: 1.3, y: 3.9, w: 10.5, h: 0.8,
  fontSize: 14, color: C_TEXT_MUTED, fontFace: FONT_BODY
});

// Badges
const badges = ['Angular 22', 'Node-RED API', 'MySQL 8.0', 'Docker Compose', 'GitHub Pages'];
badges.forEach((b, i) => {
  s1.addShape(pres.ShapeType.roundRect, {
    x: 1.3 + (i * 2.1), y: 4.8, w: 1.9, h: 0.45,
    fill: { color: 'F1F5F9' },
    line: { color: 'CBD5E1', width: 1 },
    rectRadius: 0.2
  });
  s1.addText(b, {
    x: 1.3 + (i * 2.1), y: 4.8, w: 1.9, h: 0.45,
    fontSize: 11, bold: true, color: C_PRIMARY, align: 'center', fontFace: FONT_TITLE
  });
});

// -------------------------------------------------------------
// SLIDE 2: Problem & Motivation (ที่มาและความสำคัญ)
// -------------------------------------------------------------
const s2 = createSlide('ที่มาและความสำคัญ (Problem & Motivation)', '01. BACKGROUND & GOALS');

// Left Box: Problems
s2.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.2,
  fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 }, rectRadius: 0.15
});
s2.addText('⚠️ ปัญหาที่พบในชีวิตนักศึกษา (Pain Points)', {
  x: 1.1, y: 1.7, w: 5.0, h: 0.4,
  fontSize: 16, bold: true, color: C_ROSE, fontFace: FONT_TITLE
});
s2.addText([
  { text: '• ความเครียดสะสมรอบด้าน:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   การเรียน, การสอบโปรเจกต์, ความสัมพันธ์, การเงิน และการปรับตัว\n\n' },
  { text: '• ขาดการสังเกตอารมณ์ตนเอง:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   มักละเลยความรู้สึกจนกระทบต่อสุขภาพกายและผลการเรียน\n\n' },
  { text: '• แอปพลิเคชันทั่วไปมีข้อจำกัด:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   มีค่าใช้จ่าย (Subscription), ใช้งานยาก หรือรุกล้ำความเป็นส่วนตัว' }
], { x: 1.1, y: 2.3, w: 5.0, h: 4.0, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.1 });

// Right Box: Solutions
s2.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.2,
  fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 }, rectRadius: 0.15
});
s2.addText('✨ สิ่งที่ MoodMate มอบให้ (The Solution)', {
  x: 7.1, y: 1.7, w: 5.1, h: 0.4,
  fontSize: 16, bold: true, color: C_GREEN, fontFace: FONT_TITLE
});
s2.addText([
  { text: '• พื้นที่ปลอดภัย (Safe Zone):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   เช็กอินอารมณ์รายวันได้ใน 1 นาที โดยไม่ต้องกลัวใครตัดสิน\n\n' },
  { text: '• ฟรี 100% สำหรับนักศึกษา:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ไม่มีค่าใช้จ่ายแอบแฝง เข้าใช้งานได้ทั้งคอมพิวเตอร์และมือถือ\n\n' },
  { text: '• ไม่ใช้ AI และเคารพความเป็นส่วนตัว:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ไม่นำข้อมูลความรู้สึกไปเทรนโมเดล จัดเก็บใน MySQL จริงอย่างปลอดภัย' }
], { x: 7.1, y: 2.3, w: 5.1, h: 4.0, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.1 });

// -------------------------------------------------------------
// SLIDE 3: Architecture & Tech Stack
// -------------------------------------------------------------
const s3 = createSlide('สถาปัตยกรรมระบบ (System Architecture & Tech Stack)', '02. TECHNICAL ARCHITECTURE');

const stackBoxes = [
  { title: 'Frontend (หน้าบ้าน)', sub: 'Angular 22 + TypeScript', color: C_PRIMARY, bg: 'EEF2FF', border: 'C7D2FE',
    desc: '• Single Page Application (SPA)\n• SCSS Modern Pastel UI Theme\n• Reactive Forms ตรวจสอบฟอร์ม\n• Chart.js เรนเดอร์กราฟสถิติ\n• Responsive Mobile-first' },
  { title: 'Backend (หลังบ้าน)', sub: 'Node-RED RESTful API', color: C_SECONDARY, bg: 'F0F9FF', border: 'BAE6FD',
    desc: '• REST API แยก 5 หมวดหมู่ชัดเจน\n• mysql2 (Prepared Statements)\n• bcryptjs (Password Hashing)\n• jsonwebtoken (JWT Auth)\n• ปิด Editor เพื่อความปลอดภัย' },
  { title: 'Database (ฐานข้อมูล)', sub: 'MySQL 8.0 Community', color: C_PURPLE, bg: 'FAF5FF', border: 'E9D5FF',
    desc: '• Character Set utf8mb4 (ไทย/Emoji)\n• Foreign Keys แบบ Cascade Deletion\n• Unique Constraint ป้องกันวันซ้ำ\n• Volume เก็บข้อมูลถาวร (Persistent)' },
  { title: 'DevOps & Hosting', sub: 'Docker & GitHub Pages', color: C_GREEN, bg: 'ECFDF5', border: 'A7F3D0',
    desc: '• Docker Compose จัดการ 3 Services\n• Nginx Reverse Proxy /api/ ไปหลังบ้าน\n• GitHub Pages ให้บริการเว็บสาธารณะ\n• รองรับ Tunnel สำหรับเปิดบนมือถือ' }
];

stackBoxes.forEach((b, idx) => {
  const xPos = 0.8 + (idx * 2.95);
  s3.addShape(pres.ShapeType.roundRect, {
    x: xPos, y: 1.5, w: 2.8, h: 5.2,
    fill: { color: b.bg }, line: { color: b.border, width: 1.5 }, rectRadius: 0.15
  });
  s3.addText(b.title, {
    x: xPos + 0.15, y: 1.7, w: 2.5, h: 0.35,
    fontSize: 13, bold: true, color: b.color, fontFace: FONT_TITLE
  });
  s3.addText(b.sub, {
    x: xPos + 0.15, y: 2.05, w: 2.5, h: 0.3,
    fontSize: 10.5, bold: true, color: C_TEXT_MUTED, fontFace: FONT_BODY
  });
  s3.addText(b.desc, {
    x: xPos + 0.15, y: 2.5, w: 2.5, h: 3.9,
    fontSize: 11, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });
});

// -------------------------------------------------------------
// SLIDE 4: Mood Check-in & Dashboard
// -------------------------------------------------------------
const s4 = createSlide('ฟังก์ชันบันทึกอารมณ์และแดชบอร์ด (Check-in & Dashboard)', '03. CORE FEATURES');

s4.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});
s4.addText('🌱 ระบบบันทึกอารมณ์ (Mood Check-in)', {
  x: 1.1, y: 1.7, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s4.addText([
  { text: '• 5 ระดับอารมณ์ พร้อม Emoji ภาษาไทย:\n', options: { bold: true } },
  { text: '   1. แย่มาก 😞  2. ไม่ค่อยดี 🙁  3. ปกติ 😐  4. ดี 🙂  5. ดีมาก 😄\n\n' },
  { text: '• ปัจจัยที่เกี่ยวข้อง (Multi-select Badges):\n', options: { bold: true } },
  { text: '   การเรียน, การสอบ, เพื่อน, ครอบครัว, ความสัมพันธ์, การเงิน, การนอน ฯลฯ\n\n' },
  { text: '• ระดับความเครียด 1–5 และไดอารี่บันทึกความรู้สึก\n\n' },
  { text: '• ป้องกันบันทึกซ้ำวันเดียวกัน:', options: { bold: true } },
  { text: ' มีหน้าต่างแจ้งเตือนพร้อมปุ่มแก้ไขบันทึกเดิม' }
], { x: 1.1, y: 2.2, w: 5.0, h: 4.2, fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15 });

s4.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});
s4.addText('📊 แดชบอร์ดสรุปผล (User Dashboard)', {
  x: 7.1, y: 1.7, w: 5.1, h: 0.4, fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s4.addText([
  { text: '• ทักทายด้วยชื่อผู้ใช้จริง และแสดงอารมณ์ล่าสุด\n\n' },
  { text: '• สรุปสถิติสำคัญ:\n', options: { bold: true } },
  { text: '   จำนวนวันที่บันทึกทั้งหมด, ค่าเฉลี่ยอารมณ์ และความเครียดสะสม\n\n' },
  { text: '• กราฟแนวโน้มอารมณ์ 7 วันล่าสุด (Chart.js Line Chart):\n', options: { bold: true } },
  { text: '   เห็นความเปลี่ยนแปลงของใจแบบไดนามิกจากฐานข้อมูลจริง\n\n' },
  { text: '• รายการบันทึกล่าสุด พร้อมปุ่มแก้ไขและลบรายการ' }
], { x: 7.1, y: 2.2, w: 5.1, h: 4.2, fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15 });

// -------------------------------------------------------------
// SLIDE 5: Analytics & Insights
// -------------------------------------------------------------
const s5 = createSlide('สถิติและบทวิเคราะห์สุขภาพใจ (Analytics & Insights)', '04. DATA VISUALIZATION');

s5.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 11.7, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});

s5.addText('💡 การวิเคราะห์ข้อมูลเชิงบวก (Non-clinical Supportive Insights)', {
  x: 1.1, y: 1.7, w: 11.0, h: 0.4, fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s5.addText([
  { text: '• เปรียบเทียบช่วงเวลา (7 วัน vs 30 วัน):\n', options: { bold: true } },
  { text: '   ช่วยให้นักศึกษาเห็นภาพรวมสุขภาพใจทั้งระยะสั้นและระยะยาว\n\n' },
  { text: '• กราฟสัดส่วนระดับอารมณ์ (Mood Distribution):\n', options: { bold: true } },
  { text: '   แสดงจำนวนครั้งของอารมณ์แต่ละระดับในรูปแบบแผนภูมิโดนัทเข้าใจง่าย\n\n' },
  { text: '• อันดับปัจจัยที่มีผลต่อใจบ่อยที่สุด (Top Influencing Factors):\n', options: { bold: true } },
  { text: '   แจกแจงเป็นเปอร์เซ็นต์ว่าเรื่องใดส่งผลกระทบต่อความรู้สึกมากที่สุด เช่น "การสอบ" หรือ "การนอนหลับ"\n\n' },
  { text: '• คำแนะนำด้วยภาษาที่เป็นมิตรและให้กำลังใจ:\n', options: { bold: true } },
  { text: '   สร้างข้อความสนับสนุนตามสถิติจริง ปราศจากการวินิจฉัยโรคทางการแพทย์' }
], { x: 1.1, y: 2.3, w: 11.0, h: 4.0, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.2 });

// -------------------------------------------------------------
// SLIDE 6: Self-care Activities
// -------------------------------------------------------------
const s6 = createSlide('กิจกรรมดูแลใจและฟื้นฟูพลัง (Self-care Activities)', '05. WELLNESS TOOLKIT');

s6.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.2,
  fill: { color: 'F0FDF4' }, line: { color: 'BAE6FD', width: 1 }, rectRadius: 0.15
});
s6.addText('🧘‍♀️ วิดเจ็ตฝึกหายใจแบบ 4-7-8', {
  x: 1.1, y: 1.7, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: C_SECONDARY, fontFace: FONT_TITLE
});
s6.addText([
  { text: '• เทคนิคผ่อนคลายระบบประสาทที่เป็นสากล:\n', options: { bold: true } },
  { text: '   ช่วยลดอัตราการเต้นของหัวใจและคลายความวิตกกังวลในไม่กี่นาที\n\n' },
  { text: '• Interactive Animation & Timer:\n', options: { bold: true } },
  { text: '   1. หายใจเข้าช้า ๆ 4 วินาที (วงกลมขยายตัว)\n' },
  { text: '   2. กลั้นลมหายใจไว้ 7 วินาที (รักษาสมดุล)\n' },
  { text: '   3. ผ่อนลมหายใจออก 8 วินาที (วงกลมหดตัว)\n\n' },
  { text: '• ผู้ใช้สามารถกดเริ่มและหยุดฝึกได้ตามต้องการ' }
], { x: 1.1, y: 2.3, w: 5.0, h: 4.0, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15 });

s6.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});
s6.addText('✨ กิจกรรมฮีลใจและประวัติการดูแลตัวเอง', {
  x: 7.1, y: 1.7, w: 5.1, h: 0.4, fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s6.addText([
  { text: '• กิจกรรมที่คัดสรรสำหรับนักศึกษา:\n', options: { bold: true } },
  { text: '   - พักสายตาด้วยกฎ 20-20-20\n   - เดินยืดเหยียดร่างกาย 10 นาที\n   - ฟังดนตรี Lo-fi ผ่อนคลาย\n   - เขียนบันทึกระบายความรู้สึก (Journaling)\n   - พูดคุยกับเพื่อนสนิทหรือคนที่ไว้ใจ\n\n' },
  { text: '• ติ๊ก "ทำสำเร็จแล้ว" บันทึกลงฐานข้อมูลจริง:\n', options: { bold: true } },
  { text: '   เก็บบันทึกประวัติในตาราง user_activity_logs และแสดงวันเวลาที่ทำกิจกรรมสำเร็จ' }
], { x: 7.1, y: 2.3, w: 5.1, h: 4.0, fontSize: 12.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15 });

// -------------------------------------------------------------
// SLIDE 7: Security & Privacy
// -------------------------------------------------------------
const s7 = createSlide('ความปลอดภัยและความเป็นส่วนตัว (Security & Privacy)', '06. SECURITY MEASURES');

const secItems = [
  { title: '🔒 การแยกสิทธิ์ข้อมูลเด็ดขาด (Strict Data Isolation)', desc: 'Backend ตรวจสอบ user_id จาก JWT Token เสมอ ผู้ใช้ A ไม่สามารถแอบดูหรือแก้ไขข้อมูลของผู้ใช้ B ได้ (ตอบกลับ 404 Not Found)' },
  { title: '🛡️ ป้องกัน SQL Injection 100%', desc: 'ใช้ Prepared Statements และ Parameterized Queries ผ่าน mysql2 ไม่มีการต่อ String ในคำสั่ง SQL อย่างเด็ดขาด' },
  { title: '🔑 การรักษาความปลอดภัยรหัสผ่าน', desc: 'รหัสผ่านถูกแฮชด้วย bcryptjs (Salt 10 Rounds) ก่อนบันทึกลง MySQL และไม่มีการส่งรหัสผ่านกลับไปใน API Response' },
  { title: '🗑️ สิทธิในการลบข้อมูล (Right to be Forgotten)', desc: 'ผู้ใช้สามารถกดลบบัญชีที่หน้า Profile ข้อมูลบันทึกและประวัติกิจกรรมจะถูกลบถาวรออกจาก MySQL ด้วย Foreign Key Cascade' },
  { title: '📞 ข้อตกลงและการช่วยเหลือเร่งด่วน', desc: 'มีนโยบายความเป็นส่วนตัวชัดเจน พร้อมแสดงเบอร์สายด่วนสุขภาพจิต 1323 (โทรฟรี 24 ชม.)' }
];

secItems.forEach((item, idx) => {
  const yPos = 1.5 + (idx * 1.05);
  s7.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: yPos, w: 11.7, h: 0.95,
    fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.1
  });
  s7.addText(item.title, {
    x: 1.0, y: yPos + 0.1, w: 11.3, h: 0.3,
    fontSize: 13, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
  });
  s7.addText(item.desc, {
    x: 1.0, y: yPos + 0.45, w: 11.3, h: 0.4,
    fontSize: 11.5, color: C_TEXT_MUTED, fontFace: FONT_BODY
  });
});

// -------------------------------------------------------------
// SLIDE 8: QA & Testing
// -------------------------------------------------------------
const s8 = createSlide('การทดสอบระบบ (Quality Assurance & Test Suite)', '07. SYSTEM VERIFICATION');

s8.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 11.7, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});

s8.addText('🧪 ผลการรันทดสอบอัตโนมัติ (Automated Test Suite: 21 ผ่านครบ / 0 ผิดพลาด)', {
  x: 1.1, y: 1.7, w: 11.0, h: 0.4, fontSize: 16, bold: true, color: C_GREEN, fontFace: FONT_TITLE
});

const testCols = [
  '• Register ผู้ใช้ A สำเร็จ บันทึกลง MySQL\n• ป้องกันสมัครด้วยอีเมลซ้ำ (409 Conflict)\n• Login ด้วยรหัสถูกต้อง ได้รับ JWT Token\n• ปฏิเสธ Login เมื่อรหัสผ่านผิด (401)\n• ปฏิเสธการเข้าถึง API หากไม่มี Token\n• ดึงข้อมูลส่วนตัวถูกต้องจาก Token /auth/me',
  '• บันทึกอารมณ์สำเร็จพร้อมระดับคะแนนและปัจจัย\n• ป้องกันบันทึกอารมณ์ซ้ำวันเดียวกัน (409)\n• Data Isolation: ผู้ใช้ B แอบอ่านข้อมูล A ไม่ได้ (404)\n• Data Isolation: ผู้ใช้ B แอบแก้ข้อมูล A ไม่ได้ (404)\n• ผู้ใช้ A เปิดอ่านและแก้ไขบันทึกตัวเองได้ปกติ\n• ลบบันทึกอารมณ์สำเร็จ',
  '• คำนวณสถิติ Analytics เมื่อมีข้อมูลและไม่มีข้อมูล\n• ดึง Master List กิจกรรม Self-care\n• บันทึกการทำกิจกรรมลงตาราง log สำเร็จ\n• แก้ไขชื่อแสดงผลและรหัสนักศึกษาได้\n• สั่งลบบัญชีผู้ใช้ B และ Cascade ลบข้อมูลทั้งหมด\n• ทดสอบ Database Persistence หลังสั่ง Restart'
];

testCols.forEach((col, idx) => {
  s8.addText(col, {
    x: 1.1 + (idx * 3.8), y: 2.3, w: 3.6, h: 4.0,
    fontSize: 11.5, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });
});

// -------------------------------------------------------------
// SLIDE 9: Deployment & Mobile Access
// -------------------------------------------------------------
const s9 = createSlide('การเผยแพร่และรองรับการใช้งานบนมือถือ (Deployment & Mobile)', '08. DEPLOYMENT STRATEGY');

s9.addShape(pres.ShapeType.roundRect, {
  x: 0.8, y: 1.5, w: 5.6, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});
s9.addText('🌐 เผยแพร่ผ่าน GitHub Pages', {
  x: 1.1, y: 1.7, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s9.addText([
  { text: '• URL สาธารณะอย่างเป็นทางการ:\n', options: { bold: true } },
  { text: '   https://tangeiei.github.io/MoodMate/\n\n', options: { color: C_PRIMARY, bold: true } },
  { text: '• Single Page Application (SPA) Routing:\n', options: { bold: true } },
  { text: '   แก้ปัญหาการรีเฟรชหน้าด้วย 404.html Fallback\n\n' },
  { text: '• GitHub Actions CI/CD อัตโนมัติ:\n', options: { bold: true } },
  { text: '   เมื่อ Push โค้ดขึ้น main ระบบจะ Build และ Deploy ขึ้น gh-pages ทันที' }
], { x: 1.1, y: 2.3, w: 5.0, h: 4.0, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.2 });

s9.addShape(pres.ShapeType.roundRect, {
  x: 6.8, y: 1.5, w: 5.7, h: 5.2,
  fill: { color: 'FFFFFF' }, line: { color: C_BORDER, width: 1 }, rectRadius: 0.15
});
s9.addText('📱 การเข้าใช้งานผ่านสมาร์ตโฟน', {
  x: 7.1, y: 1.7, w: 5.1, h: 0.4, fontSize: 16, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});
s9.addText([
  { text: '• Mobile-first Responsive UI:\n', options: { bold: true } },
  { text: '   ออกแบบให้ใช้งานง่ายบนหน้าจอมือถือทุกขนาด มี Hamburger Menu\n\n' },
  { text: '• สคริปต์เชื่อมต่อมือถือ (start-mobile.bat):\n', options: { bold: true } },
  { text: '   ดับเบิลคลิกเดียว สร้าง Live Tunnel (HTTPS) เชื่อมต่อ Docker ในเครื่อง\n\n' },
  { text: '• รองรับทั้ง 4G/5G และ Wi-Fi:\n', options: { bold: true } },
  { text: '   ทดลองล็อกอินและบันทึกอารมณ์ลง MySQL จริงได้ทันที' }
], { x: 7.1, y: 2.3, w: 5.1, h: 4.0, fontSize: 13, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.2 });

// -------------------------------------------------------------
// SLIDE 10: Conclusion & Q&A
// -------------------------------------------------------------
const s10 = pres.addSlide();
s10.background = { color: 'EEF2FF' };

s10.addShape(pres.ShapeType.rect, {
  x: 0.8, y: 1.5, w: 11.7, h: 4.8,
  fill: { color: 'FFFFFF' }, line: { color: 'C7D2FE', width: 1.5 },
  shadow: { type: 'outer', blur: 6, offset: 3, angle: 45, opacity: 0.1 }
});

s10.addText('สรุปผลการดำเนินงานและแผนพัฒนาในอนาคต', {
  x: 1.3, y: 1.9, w: 10.5, h: 0.5, fontSize: 24, bold: true, color: C_PRIMARY, fontFace: FONT_TITLE
});

s10.addText([
  { text: '• ความสำเร็จของโครงงาน:\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   ได้เว็บแอปพลิเคชัน MoodMate ที่พร้อมใช้งานจริงทั้ง Frontend, Backend API, MySQL และ Docker\n\n' },
  { text: '• แผนพัฒนาต่อยอด (Future Roadmap):\n', options: { bold: true, color: C_TEXT_MAIN } },
  { text: '   - เพิ่มระบบแจ้งเตือนบันทึกอารมณ์ประจำวัน (Push Notification)\n' },
  { text: '   - พัฒนาระบบส่งออกรายงานสรุปสุขภาพใจประจำเดือนเป็นเอกสาร PDF สำหรับคุยกับผู้เชี่ยวชาญ\n\n' },
  { text: 'ขอขอบพระคุณอาจารย์และคณะกรรมการทุกท่านครับ / ค่ะ\nยินดีรับฟังข้อเสนอแนะและตอบข้อซักถาม (Q&A)', options: { bold: true, color: C_PRIMARY } }
], { x: 1.3, y: 2.6, w: 10.5, h: 3.3, fontSize: 14, color: C_TEXT_MAIN, fontFace: FONT_BODY, lineSpacingMultiple: 1.25 });

// Save PowerPoint Presentation
const outputDir = path.join(__dirname, 'presentation');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'MoodMate_Presentation.pptx');
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log('PowerPoint presentation generated successfully at: ' + outputPath);
}).catch(err => {
  console.error('Error generating presentation:', err);
});
