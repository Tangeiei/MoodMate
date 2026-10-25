const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');

const screenshotsDir = path.join(__dirname, 'presentation', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function apiRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:8080/api' + endpoint);
    const postData = body ? JSON.stringify(body) : '';

    const headers = { 'Content-Type': 'application/json' };
    if (body) headers['Content-Length'] = Buffer.byteLength(postData);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function prepareDemoData() {
  const demoEmail = `demo.student@university.ac.th`;
  const demoPassword = 'Password123!';

  console.log('Registering / Logging in demo user...');
  let loginRes = await apiRequest('POST', '/auth/login', {
    email: demoEmail,
    password: demoPassword
  });

  let token = null;
  let user = null;

  if (!loginRes.success) {
    const regRes = await apiRequest('POST', '/auth/register', {
      display_name: 'กิตติศักดิ์ พัฒนากูล (Demo Student)',
      email: demoEmail,
      password: demoPassword,
      confirm_password: demoPassword,
      student_id: '65010888',
      privacy_accepted: true
    });
    if (regRes.success) {
      token = regRes.token;
      user = regRes.user;
    }
  } else {
    token = loginRes.token;
    user = loginRes.user;
  }

  console.log('Seeding mood entries for demo...');
  const today = new Date();
  const sampleMoods = [
    { daysAgo: 5, score: 3, energy: 3, sleep: 6.5, note: 'วันแรกของการเปิดเทอม เหนื่อยกับการเดินทางนิดหน่อย', factor: 1 },
    { daysAgo: 4, score: 2, energy: 2, sleep: 5.0, note: 'เริ่มมีการบ้านโปรเจกต์กลุ่ม รู้สึกกังวลเรื่องเวลาส่งงาน', factor: 2 },
    { daysAgo: 3, score: 4, energy: 4, sleep: 7.5, note: 'ทำงานกลุ่มเสร็จไปหนึ่งส่วน เพื่อนๆ ให้ความร่วมมือดีมาก รู้สึกโล่งใจ', factor: 4 },
    { daysAgo: 2, score: 4, energy: 4, sleep: 8.0, note: 'ได้ไปออกกำลังกายยามเย็นและกินอาหารอร่อยๆ สบายใจขึ้นเยอะ', factor: 9 },
    { daysAgo: 1, score: 5, energy: 5, sleep: 7.5, note: 'เข้าใจเนื้อหาในคลาส รู้สึกมั่นใจและพร้อมสำหรับพรีเซนต์!', factor: 1 }
  ];

  for (const m of sampleMoods) {
    const d = new Date(today);
    d.setDate(d.getDate() - m.daysAgo);
    const dateStr = d.toISOString().split('T')[0];

    await apiRequest('POST', '/moods', {
      entry_date: dateStr,
      score: m.score,
      energy_level: m.energy,
      sleep_hours: m.sleep,
      note: m.note,
      factor_id: m.factor,
      tags: ['การเรียน', 'โปรเจกต์', 'สุขภาพ']
    }, token);
  }

  return { token, user };
}

async function captureScreenshots() {
  const { token, user } = await prepareDemoData();

  console.log('Launching Chrome browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Landing Page
  console.log('Capturing 00_landing.png...');
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(screenshotsDir, '00_landing.png') });

  // 2. Login Page
  console.log('Capturing 01_login.png...');
  await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(screenshotsDir, '01_login.png') });

  // Inject session into localStorage with correct keys
  await page.evaluate((jwt, userData) => {
    localStorage.setItem('moodmate_auth_token', jwt);
    localStorage.setItem('moodmate_auth_user', JSON.stringify(userData));
  }, token, user);

  // 3. Dashboard Page
  console.log('Capturing 02_dashboard.png...');
  await page.goto('http://localhost:8080/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard.png') });

  // 4. Mood Check-in Page
  console.log('Capturing 03_checkin.png...');
  await page.goto('http://localhost:8080/mood-checkin', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, '03_checkin.png') });

  // 5. Analytics Page
  console.log('Capturing 04_analytics.png...');
  await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, '04_analytics.png') });

  // 6. History Page
  console.log('Capturing 05_history.png...');
  await page.goto('http://localhost:8080/mood-history', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, '05_history.png') });

  // 7. Activities Page
  console.log('Capturing 06_activities.png...');
  await page.goto('http://localhost:8080/activities', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, '06_activities.png') });

  // 8. Mobile View (Dashboard)
  console.log('Capturing 07_mobile_view.png...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8080/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, '07_mobile_view.png') });

  console.log('All authentic screenshots captured successfully!');
  await browser.close();
}

captureScreenshots().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
