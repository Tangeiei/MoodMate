/**
 * MoodMate Automated Test Suite
 * Tests all requirements from Section 11:
 * - Register valid
 * - Register duplicate email
 * - Login valid and invalid
 * - Unauthenticated API access
 * - User isolation (User A tries to read/edit User B's entry)
 * - Mood CRUD (Create, Read, Update, Delete)
 * - Duplicate date entry prevention
 * - Analytics calculation
 * - Self-care activities (List, Complete, History)
 * - Profile and Account Deletion
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080/api'; // Testing through frontend Nginx reverse proxy

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const postData = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json'
    };

    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(postData);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - Detail: ${JSON.stringify(detail)}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   MoodMate Full-Stack Test Suite');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const userAEmail = `student_a_${timestamp}@test.ac.th`;
  const userBEmail = `student_b_${timestamp}@test.ac.th`;
  const passwordA = 'SecurePass123!';
  const passwordB = 'SecurePass456!';

  let userAToken = null;
  let userBToken = null;
  let userAId = null;
  let userBId = null;
  let userAEntryId = null;

  try {
    // 1. Register User A
    console.log('1. Testing User Registration...');
    const regRes = await request('POST', '/auth/register', {
      display_name: 'สมชาย นักศึกษาเอ',
      email: userAEmail,
      password: passwordA,
      confirm_password: passwordA,
      student_id: '64010111',
      privacy_accepted: true
    });
    assert(regRes.statusCode === 201 && regRes.data.success === true, 'Register User A with valid data', regRes.data);
    userAToken = regRes.data.token;
    userAId = regRes.data.user.id;

    // 2. Register with Duplicate Email
    const dupRes = await request('POST', '/auth/register', {
      display_name: 'คนเดิม อีเมลซ้ำ',
      email: userAEmail,
      password: 'AnotherPassword123',
      confirm_password: 'AnotherPassword123',
      privacy_accepted: true
    });
    assert(dupRes.statusCode === 409 && dupRes.data.success === false, 'Prevent duplicate email registration (409 Conflict)', dupRes.data);

    // 3. Register User B
    const regBRes = await request('POST', '/auth/register', {
      display_name: 'สมหญิง นักศึกษาบี',
      email: userBEmail,
      password: passwordB,
      confirm_password: passwordB,
      student_id: '64010222',
      privacy_accepted: true
    });
    assert(regBRes.statusCode === 201 && regBRes.data.success === true, 'Register User B successfully', regBRes.data);
    userBToken = regBRes.data.token;
    userBId = regBRes.data.user.id;

    // 4. Login with Correct Credentials
    console.log('\n2. Testing Authentication & Session...');
    const loginOk = await request('POST', '/auth/login', {
      email: userAEmail,
      password: passwordA
    });
    assert(loginOk.statusCode === 200 && loginOk.data.success === true && !!loginOk.data.token, 'Login with correct credentials', loginOk.data);

    // 5. Login with Incorrect Password
    const loginBad = await request('POST', '/auth/login', {
      email: userAEmail,
      password: 'WrongPassword999'
    });
    assert(loginBad.statusCode === 401 && loginBad.data.success === false, 'Reject login with invalid credentials (401)', loginBad.data);

    // 6. Access Protected API without Token
    const unauthRes = await request('GET', '/auth/me');
    assert(unauthRes.statusCode === 401, 'Deny unauthenticated request without token (401)', unauthRes.data);

    // 7. Access /auth/me with Valid Token
    const meRes = await request('GET', '/auth/me', null, userAToken);
    assert(meRes.statusCode === 200 && meRes.data.user.email === userAEmail, 'Verify GET /auth/me returns User A details', meRes.data);

    // 8. Create Mood Entry for User A
    console.log('\n3. Testing Mood Entries & Duplicate Prevention...');
    const today = new Date().toISOString().split('T')[0];
    const postMood = await request('POST', '/moods', {
      entry_date: today,
      mood_score: 4,
      mood_label: 'ดี',
      stress_level: 2,
      journal_text: 'วันนี้อ่านหนังสือเข้าใจดี ทำแล็บเสร็จตามเวลา รู้สึกโล่งใจมาก',
      factor_ids: [1, 2] // การเรียน, การสอบ
    }, userAToken);
    assert(postMood.statusCode === 201 && postMood.data.success === true && !!postMood.data.id, 'Create Mood Entry with score 4 and factors', postMood.data);
    userAEntryId = postMood.data.id;

    // 9. Prevent Duplicate Entry for Same User and Same Date
    const dupMood = await request('POST', '/moods', {
      entry_date: today,
      mood_score: 3,
      mood_label: 'ปกติ',
      factor_ids: [1]
    }, userAToken);
    assert(dupMood.statusCode === 409 && dupMood.data.success === false, 'Prevent duplicate check-in on the same date (409)', dupMood.data);

    // 10. Data Isolation: User B tries to read User A's Mood Entry
    console.log('\n4. Testing Strict Data Isolation & Authorization...');
    const bReadsA = await request('GET', `/moods/${userAEntryId}`, null, userBToken);
    assert(bReadsA.statusCode === 404, 'User B CANNOT read User A entry (Returns 404 Not Found)', bReadsA.data);

    // 11. Data Isolation: User B tries to edit User A's Mood Entry
    const bEditsA = await request('PUT', `/moods/${userAEntryId}`, {
      entry_date: today,
      mood_score: 1,
      mood_label: 'แย่มาก',
      factor_ids: [1]
    }, userBToken);
    assert(bEditsA.statusCode === 404, 'User B CANNOT modify User A entry (Returns 404 Not Found)', bEditsA.data);

    // 12. User A successfully reads their own entry
    const aReadsA = await request('GET', `/moods/${userAEntryId}`, null, userAToken);
    assert(aReadsA.statusCode === 200 && aReadsA.data.data.id === userAEntryId && aReadsA.data.data.mood_score === 4, 'User A reads own entry with details', aReadsA.data);

    // 13. User A updates their own entry
    const aUpdatesA = await request('PUT', `/moods/${userAEntryId}`, {
      entry_date: today,
      mood_score: 5,
      mood_label: 'ดีมาก',
      stress_level: 1,
      journal_text: 'อัปเดต: ได้คะแนนควิซเต็ม รู้สึกสดใสมาก!',
      factor_ids: [1, 9]
    }, userAToken);
    assert(aUpdatesA.statusCode === 200 && aUpdatesA.data.success === true, 'User A updates own mood entry to score 5', aUpdatesA.data);

    // 14. Analytics API
    console.log('\n5. Testing Analytics Calculation...');
    const analyticsRes = await request('GET', '/analytics/moods?period=7d', null, userAToken);
    assert(
      analyticsRes.statusCode === 200 &&
      analyticsRes.data.success === true &&
      analyticsRes.data.summary.total_entries >= 1 &&
      analyticsRes.data.summary.average_mood === '5.0',
      'Analytics calculates average mood score correctly',
      analyticsRes.data
    );

    // 15. Self-Care Activities
    console.log('\n6. Testing Self-Care Activities...');
    const actList = await request('GET', '/activities', null, userAToken);
    assert(actList.statusCode === 200 && actList.data.data.length >= 6, 'Fetch master list of self-care activities', actList.data.data.length);

    const completeAct = await request('POST', `/activities/1/complete`, {}, userAToken);
    assert(completeAct.statusCode === 200 && completeAct.data.success === true, 'Complete activity #1 (4-7-8 Breathing)', completeAct.data);

    const actHistory = await request('GET', '/activities/history', null, userAToken);
    assert(actHistory.statusCode === 200 && actHistory.data.data.length >= 1, 'Retrieve activity completion history', actHistory.data);

    // 16. Profile & Account Deletion
    console.log('\n7. Testing Profile & Account Cascade Deletion...');
    const profileRes = await request('GET', '/profile', null, userAToken);
    assert(profileRes.statusCode === 200 && profileRes.data.data.email === userAEmail, 'Get User Profile with stats', profileRes.data);

    const updateProfile = await request('PUT', '/profile', {
      display_name: 'สมชาย นักศึกษาเอ (แก้ไขชื่อ)',
      student_id: '64010999'
    }, userAToken);
    assert(updateProfile.statusCode === 200 && updateProfile.data.user.display_name === 'สมชาย นักศึกษาเอ (แก้ไขชื่อ)', 'Update user display name', updateProfile.data);

    // Delete User B account
    const delAcc = await request('DELETE', '/account', null, userBToken);
    assert(delAcc.statusCode === 200 && delAcc.data.success === true, 'Delete User B account and cascade all data', delAcc.data);

    // Verify User B is deleted
    const loginDeleted = await request('POST', '/auth/login', {
      email: userBEmail,
      password: passwordB
    });
    assert(loginDeleted.statusCode === 401, 'Deleted user cannot log in anymore', loginDeleted.data);

    console.log('\n====================================================');
    console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite encountered fatal error:', err);
    process.exit(1);
  }
}

runTests();
