/**
 * Script to generate Node-RED flows.json with full REST API implementation
 */
const fs = require('fs');
const path = require('path');

let nextId = 1;
function genId() {
  return 'node_' + (nextId++).toString(16).padStart(4, '0') + '_' + Math.random().toString(36).substring(2, 7);
}

const tabs = [
  { id: 'tab_init', type: 'tab', label: '0. Initialization & DB Helper', disabled: false, info: 'DB Pool initialization & helper functions' },
  { id: 'tab_auth', type: 'tab', label: '1. Authentication API', disabled: false, info: 'Register, Login, Logout, Me' },
  { id: 'tab_moods', type: 'tab', label: '2. Mood Entries API', disabled: false, info: 'CRUD for Moods & Factors' },
  { id: 'tab_analytics', type: 'tab', label: '3. Analytics API', disabled: false, info: 'Mood trends, score distributions, and factors' },
  { id: 'tab_activities', type: 'tab', label: '4. Self-care Activities API', disabled: false, info: 'Activities list, mark complete, history' },
  { id: 'tab_profile', type: 'tab', label: '5. Profile & Account API', disabled: false, info: 'Profile view, update, delete account' }
];

const nodes = [...tabs];

// Tab 0: Initialization
const initInjectId = genId();
const initFuncId = genId();

nodes.push({
  id: initInjectId,
  type: 'inject',
  z: 'tab_init',
  name: 'Init On Startup',
  props: [{ p: 'payload' }],
  repeat: '',
  crontab: '',
  once: true,
  onceDelay: 0.1,
  topic: '',
  payload: '',
  payloadType: 'date',
  x: 140,
  y: 100,
  wires: [[initFuncId]]
});

const initFuncCode = `
const mysql = global.get('mysql');
const jwt = global.get('jwt');
const env = global.get('env');

if (!global.get('dbPool')) {
    const pool = mysql.createPool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    });
    global.set('dbPool', pool);
    node.log('MySQL Connection Pool Initialized for ' + env.DB_NAME + ' at ' + env.DB_HOST);
}

// Global helper to verify JWT Bearer token
global.set('authenticateUser', function(msg) {
    const authHeader = (msg.req && msg.req.headers) ? (msg.req.headers['authorization'] || msg.req.headers['Authorization']) : null;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Token ไม่ถูกต้องหรือไม่มี)' };
    }
    const token = authHeader.substring(7).trim();
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        return { user: decoded };
    } catch (err) {
        return { error: 'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง' };
    }
});

msg.payload = { status: 'Database Pool and Helpers Ready' };
return msg;
`;

nodes.push({
  id: initFuncId,
  type: 'function',
  z: 'tab_init',
  name: 'Create DB Pool & Helpers',
  func: initFuncCode,
  outputs: 1,
  noerr: 0,
  initialize: '',
  finalize: '',
  libs: [],
  x: 380,
  y: 100,
  wires: [[]]
});

// Helper function to create an API route pattern
function createApiRoute(tabId, method, url, name, handlerCode, yPos) {
  const httpInId = genId();
  const funcId = genId();
  const httpOutId = genId();

  nodes.push({
    id: httpInId,
    type: 'http in',
    z: tabId,
    name: `${method.toUpperCase()} ${url}`,
    url: url,
    method: method.toLowerCase(),
    upload: false,
    swaggerDoc: '',
    x: 160,
    y: yPos,
    wires: [[funcId]]
  });

  nodes.push({
    id: funcId,
    type: 'function',
    z: tabId,
    name: name,
    func: handlerCode,
    outputs: 1,
    noerr: 0,
    initialize: '',
    finalize: '',
    libs: [],
    x: 420,
    y: yPos,
    wires: [[httpOutId]]
  });

  nodes.push({
    id: httpOutId,
    type: 'http response',
    z: tabId,
    name: 'Response',
    statusCode: '',
    headers: {},
    x: 680,
    y: yPos,
    wires: []
  });
}

// -------------------------------------------------------------
// TAB 1: AUTHENTICATION
// -------------------------------------------------------------

// POST /api/auth/register
const registerCode = `
const pool = global.get('dbPool');
const bcrypt = global.get('bcrypt');
const jwt = global.get('jwt');
const env = global.get('env');

(async () => {
    try {
        if (!pool) {
            msg.statusCode = 503;
            msg.payload = { success: false, message: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง' };
            node.send(msg);
            return;
        }

        const body = msg.payload || {};
        const { display_name, email, password, confirm_password, student_id, privacy_accepted } = body;

        // Validation
        if (!display_name || !display_name.trim()) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'กรุณากรอกชื่อที่ใช้แสดง' };
            node.send(msg);
            return;
        }

        if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        if (!password || password.length < 6) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
            node.send(msg);
            return;
        }

        if (password !== confirm_password) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' };
            node.send(msg);
            return;
        }

        if (!privacy_accepted) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก' };
            node.send(msg);
            return;
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = display_name.trim();
        const cleanStudentId = student_id ? student_id.trim() : null;

        // Check duplicate email
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
        if (existing.length > 0) {
            msg.statusCode = 409;
            msg.payload = { success: false, message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ' };
            node.send(msg);
            return;
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.execute(
            'INSERT INTO users (display_name, email, student_id, password_hash) VALUES (?, ?, ?, ?)',
            [cleanName, cleanEmail, cleanStudentId, password_hash]
        );

        const newUserId = result.insertId;

        // Generate JWT
        const tokenPayload = { id: newUserId, email: cleanEmail, display_name: cleanName };
        const token = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

        msg.statusCode = 201;
        msg.payload = {
            success: true,
            message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ MoodMate',
            token: token,
            user: {
                id: newUserId,
                display_name: cleanName,
                email: cleanEmail,
                student_id: cleanStudentId
            }
        };
        node.send(msg);
    } catch (err) {
        node.error('Register error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_auth', 'POST', '/api/auth/register', 'Register Handler', registerCode, 100);

// POST /api/auth/login
const loginCode = `
const pool = global.get('dbPool');
const bcrypt = global.get('bcrypt');
const jwt = global.get('jwt');
const env = global.get('env');

(async () => {
    try {
        if (!pool) {
            msg.statusCode = 503;
            msg.payload = { success: false, message: 'ระบบฐานข้อมูลยังไม่พร้อมใช้งาน' };
            node.send(msg);
            return;
        }

        const body = msg.payload || {};
        const { email, password } = body;

        if (!email || !password) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
            node.send(msg);
            return;
        }

        const cleanEmail = email.trim().toLowerCase();

        const [users] = await pool.execute(
            'SELECT id, display_name, email, student_id, password_hash FROM users WHERE email = ? LIMIT 1',
            [cleanEmail]
        );

        if (users.length === 0) {
            msg.statusCode = 401;
            msg.payload = { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            msg.statusCode = 401;
            msg.payload = { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        // Generate token
        const tokenPayload = { id: user.id, email: user.email, display_name: user.display_name };
        const token = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            token: token,
            user: {
                id: user.id,
                display_name: user.display_name,
                email: user.email,
                student_id: user.student_id
            }
        };
        node.send(msg);
    } catch (err) {
        node.error('Login error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_auth', 'POST', '/api/auth/login', 'Login Handler', loginCode, 200);

// POST /api/auth/logout
const logoutCode = `
msg.statusCode = 200;
msg.payload = { success: true, message: 'ออกจากระบบสำเร็จ' };
return msg;
`;
createApiRoute('tab_auth', 'POST', '/api/auth/logout', 'Logout Handler', logoutCode, 300);

// GET /api/auth/me
const meCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, display_name, email, student_id, created_at FROM users WHERE id = ? LIMIT 1',
            [auth.user.id]
        );
        if (rows.length === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบข้อมูลผู้ใช้ในระบบ' };
            node.send(msg);
            return;
        }
        msg.statusCode = 200;
        msg.payload = { success: true, user: rows[0] };
        node.send(msg);
    } catch (err) {
        node.error('Me error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_auth', 'GET', '/api/auth/me', 'Get Me Handler', meCode, 400);

// -------------------------------------------------------------
// TAB 2: MOOD ENTRIES & FACTORS
// -------------------------------------------------------------

// GET /api/moods/factors
const factorsCode = `
const pool = global.get('dbPool');
(async () => {
    try {
        const [factors] = await pool.execute(
            'SELECT id, name FROM mood_factors WHERE is_active = TRUE ORDER BY id ASC'
        );
        msg.statusCode = 200;
        msg.payload = { success: true, data: factors };
        node.send(msg);
    } catch (err) {
        node.error('Get factors error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'ไม่สามารถดึงข้อมูลปัจจัยอารมณ์ได้' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_moods', 'GET', '/api/moods/factors', 'Get Factors', factorsCode, 80);

// GET /api/moods
const getMoodsCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
const query = (msg.req && msg.req.query) || {};

(async () => {
    try {
        const userId = auth.user.id;
        let page = parseInt(query.page || '1', 10);
        let limit = parseInt(query.limit || '10', 10);
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;
        const offset = (page - 1) * limit;

        const whereClauses = ['m.user_id = ?'];
        const params = [userId];

        if (query.start_date) {
            whereClauses.push('m.entry_date >= ?');
            params.push(query.start_date);
        }
        if (query.end_date) {
            whereClauses.push('m.entry_date <= ?');
            params.push(query.end_date);
        }
        if (query.mood_score) {
            whereClauses.push('m.mood_score = ?');
            params.push(parseInt(query.mood_score, 10));
        }
        if (query.factor_id) {
            whereClauses.push('EXISTS (SELECT 1 FROM entry_factors ef2 WHERE ef2.mood_entry_id = m.id AND ef2.factor_id = ?)');
            params.push(parseInt(query.factor_id, 10));
        }

        const whereSql = whereClauses.join(' AND ');

        // Total count
        const countSql = 'SELECT COUNT(DISTINCT m.id) as total FROM mood_entries m WHERE ' + whereSql;
        const [countResult] = await pool.execute(countSql, params);
        const total = countResult[0].total;

        // Fetch paginated entries with factors
        const dataSql = \`
            SELECT 
                m.id, 
                DATE_FORMAT(m.entry_date, '%Y-%m-%d') as entry_date, 
                m.mood_score, 
                m.mood_label, 
                m.stress_level, 
                m.journal_text, 
                m.created_at, 
                m.updated_at,
                GROUP_CONCAT(f.name ORDER BY f.id SEPARATOR ', ') AS factor_names,
                GROUP_CONCAT(f.id ORDER BY f.id SEPARATOR ',') AS factor_ids_str
            FROM mood_entries m
            LEFT JOIN entry_factors ef ON m.id = ef.mood_entry_id
            LEFT JOIN mood_factors f ON ef.factor_id = f.id
            WHERE \${whereSql}
            GROUP BY m.id
            ORDER BY m.entry_date DESC, m.id DESC
            LIMIT ? OFFSET ?
        \`;

        // LIMIT and OFFSET as numbers
        const dataParams = [...params, limit, offset];
        // In mysql2 execute, limit/offset work when passed as numbers or string depending on prepared statement mode
        const [rows] = await pool.query(dataSql, dataParams);

        const items = rows.map(r => ({
            id: r.id,
            entry_date: r.entry_date,
            mood_score: r.mood_score,
            mood_label: r.mood_label,
            stress_level: r.stress_level,
            journal_text: r.journal_text,
            created_at: r.created_at,
            updated_at: r.updated_at,
            factor_names: r.factor_names ? r.factor_names.split(', ') : [],
            factor_ids: r.factor_ids_str ? r.factor_ids_str.split(',').map(id => parseInt(id, 10)) : []
        }));

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
        node.send(msg);
    } catch (err) {
        node.error('Get moods error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการดึงรายการบันทึกอารมณ์' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_moods', 'GET', '/api/moods', 'Get Moods (List & Filter)', getMoodsCode, 180);

// POST /api/moods
const postMoodCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    let conn;
    try {
        const userId = auth.user.id;
        const body = msg.payload || {};
        const { entry_date, mood_score, mood_label, stress_level, journal_text, factor_ids } = body;

        // Validation
        if (!entry_date || !/^\\d{4}-\\d{2}-\\d{2}$/.test(entry_date)) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'กรุณาระบุวันที่บันทึกให้ถูกต้อง (รูปแบบ YYYY-MM-DD)' };
            node.send(msg);
            return;
        }

        const score = parseInt(mood_score, 10);
        if (isNaN(score) || score < 1 || score > 5) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'คะแนนอารมณ์ต้องอยู่ระหว่าง 1 ถึง 5' };
            node.send(msg);
            return;
        }

        const labels = { 1: 'แย่มาก', 2: 'ไม่ค่อยดี', 3: 'ปกติ', 4: 'ดี', 5: 'ดีมาก' };
        const finalLabel = mood_label && mood_label.trim() ? mood_label.trim() : labels[score];

        let finalStress = null;
        if (stress_level !== undefined && stress_level !== null && stress_level !== '') {
            const s = parseInt(stress_level, 10);
            if (!isNaN(s) && s >= 1 && s <= 5) {
                finalStress = s;
            }
        }

        // Check duplicate entry for the same date for this user
        const [existing] = await pool.execute(
            'SELECT id FROM mood_entries WHERE user_id = ? AND entry_date = ? LIMIT 1',
            [userId, entry_date]
        );

        if (existing.length > 0) {
            msg.statusCode = 409;
            msg.payload = {
                success: false,
                message: 'คุณมีบันทึกอารมณ์ของวันที่ ' + entry_date + ' อยู่แล้ว สามารถเลือกดูหรือแก้ไขบันทึกเดิมได้',
                existing_id: existing[0].id
            };
            node.send(msg);
            return;
        }

        // Transaction for inserting entry + factors
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [insertResult] = await conn.execute(
            'INSERT INTO mood_entries (user_id, entry_date, mood_score, mood_label, stress_level, journal_text) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, entry_date, score, finalLabel, finalStress, journal_text ? journal_text.trim() : null]
        );

        const entryId = insertResult.insertId;

        // Insert factors if provided
        if (Array.isArray(factor_ids) && factor_ids.length > 0) {
            for (const fId of factor_ids) {
                const cleanFId = parseInt(fId, 10);
                if (!isNaN(cleanFId)) {
                    await conn.execute(
                        'INSERT INTO entry_factors (mood_entry_id, factor_id) VALUES (?, ?)',
                        [entryId, cleanFId]
                    );
                }
            }
        }

        await conn.commit();

        msg.statusCode = 201;
        msg.payload = {
            success: true,
            message: 'บันทึกอารมณ์เรียบร้อยแล้ว ขอบคุณที่ดูแลใจตัวเองในวันนี้',
            id: entryId
        };
        node.send(msg);
    } catch (err) {
        if (conn) await conn.rollback();
        node.error('Post mood error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกอารมณ์' };
        node.send(msg);
    } finally {
        if (conn) conn.release();
    }
})();
`;
createApiRoute('tab_moods', 'POST', '/api/moods', 'Create Mood Entry', postMoodCode, 280);

// GET /api/moods/:id
const getSingleMoodCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
const entryId = parseInt(msg.req.params.id, 10);

(async () => {
    try {
        if (isNaN(entryId)) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รหัสบันทึกไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        // Strict isolation: user_id check
        const [rows] = await pool.execute(
            \`SELECT id, user_id, DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, 
                    mood_score, mood_label, stress_level, journal_text, created_at, updated_at 
             FROM mood_entries 
             WHERE id = ? AND user_id = ? LIMIT 1\`,
            [entryId, auth.user.id]
        );

        if (rows.length === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบบันทึกอารมณ์ หรือคุณไม่มีสิทธิ์เข้าถึงบันทึกนี้' };
            node.send(msg);
            return;
        }

        const entry = rows[0];

        // Fetch factors
        const [factors] = await pool.execute(
            \`SELECT f.id, f.name 
             FROM entry_factors ef 
             JOIN mood_factors f ON ef.factor_id = f.id 
             WHERE ef.mood_entry_id = ?\`,
            [entryId]
        );

        entry.factors = factors;
        entry.factor_ids = factors.map(f => f.id);

        msg.statusCode = 200;
        msg.payload = { success: true, data: entry };
        node.send(msg);
    } catch (err) {
        node.error('Get single mood error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบันทึก' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_moods', 'GET', '/api/moods/:id', 'Get Mood by ID', getSingleMoodCode, 380);

// PUT /api/moods/:id
const putMoodCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
const entryId = parseInt(msg.req.params.id, 10);

(async () => {
    let conn;
    try {
        if (isNaN(entryId)) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รหัสบันทึกไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        const userId = auth.user.id;
        const body = msg.payload || {};
        const { entry_date, mood_score, mood_label, stress_level, journal_text, factor_ids } = body;

        // Check ownership
        const [check] = await pool.execute(
            'SELECT id, entry_date FROM mood_entries WHERE id = ? AND user_id = ? LIMIT 1',
            [entryId, userId]
        );

        if (check.length === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบบันทึกที่ต้องการแก้ไข หรือคุณไม่มีสิทธิ์เข้าถึง' };
            node.send(msg);
            return;
        }

        const score = parseInt(mood_score, 10);
        if (isNaN(score) || score < 1 || score > 5) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'คะแนนอารมณ์ต้องอยู่ระหว่าง 1 ถึง 5' };
            node.send(msg);
            return;
        }

        const labels = { 1: 'แย่มาก', 2: 'ไม่ค่อยดี', 3: 'ปกติ', 4: 'ดี', 5: 'ดีมาก' };
        const finalLabel = mood_label && mood_label.trim() ? mood_label.trim() : labels[score];

        let finalStress = null;
        if (stress_level !== undefined && stress_level !== null && stress_level !== '') {
            const s = parseInt(stress_level, 10);
            if (!isNaN(s) && s >= 1 && s <= 5) {
                finalStress = s;
            }
        }

        // If entry_date changed, verify uniqueness
        if (entry_date && entry_date !== check[0].entry_date) {
            const [dup] = await pool.execute(
                'SELECT id FROM mood_entries WHERE user_id = ? AND entry_date = ? AND id != ? LIMIT 1',
                [userId, entry_date, entryId]
            );
            if (dup.length > 0) {
                msg.statusCode = 409;
                msg.payload = { success: false, message: 'มีบันทึกอารมณ์ของวันที่ ' + entry_date + ' อยู่แล้ว' };
                node.send(msg);
                return;
            }
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Update mood entry
        await conn.execute(
            \`UPDATE mood_entries 
             SET mood_score = ?, mood_label = ?, stress_level = ?, journal_text = ?, 
                 entry_date = COALESCE(?, entry_date)
             WHERE id = ? AND user_id = ?\`,
            [score, finalLabel, finalStress, journal_text ? journal_text.trim() : null, entry_date || null, entryId, userId]
        );

        // Sync factors: delete old, insert new
        await conn.execute('DELETE FROM entry_factors WHERE mood_entry_id = ?', [entryId]);

        if (Array.isArray(factor_ids) && factor_ids.length > 0) {
            for (const fId of factor_ids) {
                const cleanFId = parseInt(fId, 10);
                if (!isNaN(cleanFId)) {
                    await conn.execute(
                        'INSERT INTO entry_factors (mood_entry_id, factor_id) VALUES (?, ?)',
                        [entryId, cleanFId]
                    );
                }
            }
        }

        await conn.commit();

        msg.statusCode = 200;
        msg.payload = { success: true, message: 'แก้ไขบันทึกอารมณ์สำเร็จ' };
        node.send(msg);
    } catch (err) {
        if (conn) await conn.rollback();
        node.error('Put mood error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขบันทึก' };
        node.send(msg);
    } finally {
        if (conn) conn.release();
    }
})();
`;
createApiRoute('tab_moods', 'PUT', '/api/moods/:id', 'Update Mood Entry', putMoodCode, 480);

// DELETE /api/moods/:id
const deleteMoodCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
const entryId = parseInt(msg.req.params.id, 10);

(async () => {
    try {
        if (isNaN(entryId)) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รหัสบันทึกไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        const [result] = await pool.execute(
            'DELETE FROM mood_entries WHERE id = ? AND user_id = ?',
            [entryId, auth.user.id]
        );

        if (result.affectedRows === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบบันทึกที่ต้องการลบ หรือคุณไม่มีสิทธิ์ลบรายการนี้' };
            node.send(msg);
            return;
        }

        msg.statusCode = 200;
        msg.payload = { success: true, message: 'ลบบันทึกอารมณ์เรียบร้อยแล้ว' };
        node.send(msg);
    } catch (err) {
        node.error('Delete mood error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการลบบันทึก' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_moods', 'DELETE', '/api/moods/:id', 'Delete Mood Entry', deleteMoodCode, 580);

// -------------------------------------------------------------
// TAB 3: ANALYTICS
// -------------------------------------------------------------

// GET /api/analytics/moods
const analyticsCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
const query = (msg.req && msg.req.query) || {};

(async () => {
    try {
        const userId = auth.user.id;
        const period = query.period === '30d' ? '30d' : '7d';
        const days = period === '30d' ? 30 : 7;

        // 1. Overall & trend in the selected period
        const [trend] = await pool.execute(
            \`SELECT 
                DATE_FORMAT(entry_date, '%Y-%m-%d') as date,
                mood_score,
                mood_label,
                stress_level
             FROM mood_entries
             WHERE user_id = ? AND entry_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
             ORDER BY entry_date ASC\`,
            [userId, days]
        );

        // 2. Score distribution
        const [distRows] = await pool.execute(
            \`SELECT mood_score, COUNT(*) as count
             FROM mood_entries
             WHERE user_id = ? AND entry_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
             GROUP BY mood_score\`,
            [userId, days]
        );

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distRows.forEach(r => {
            distribution[r.mood_score] = r.count;
        });

        // 3. Top Factors
        const [topFactors] = await pool.execute(
            \`SELECT f.id, f.name, COUNT(*) as count
             FROM entry_factors ef
             JOIN mood_entries m ON ef.mood_entry_id = m.id
             JOIN mood_factors f ON ef.factor_id = f.id
             WHERE m.user_id = ? AND m.entry_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
             GROUP BY f.id, f.name
             ORDER BY count DESC
             LIMIT 5\`,
            [userId, days]
        );

        // 4. Summary metrics
        let totalScore = 0;
        let totalStress = 0;
        let stressCount = 0;
        trend.forEach(t => {
            totalScore += t.mood_score;
            if (t.stress_level) {
                totalStress += t.stress_level;
                stressCount++;
            }
        });

        const entryCount = trend.length;
        const avgMood = entryCount > 0 ? (totalScore / entryCount).toFixed(1) : null;
        const avgStress = stressCount > 0 ? (totalStress / stressCount).toFixed(1) : null;

        // 5. Friendly non-clinical supportive insight message (Thai)
        let insight = '';
        if (entryCount === 0) {
            insight = 'ยังไม่มีข้อมูลบันทึกอารมณ์ในช่วง ' + days + ' วันที่ผ่านมา ลองเริ่มบันทึกอารมณ์วันนี้เพื่อดูแนวโน้มสุขภาพใจของคุณนะ!';
        } else {
            const numAvg = parseFloat(avgMood);
            if (numAvg >= 4.0) {
                insight = 'ช่วง ' + days + ' วันนี้ อารมณ์ของคุณอยู่ในเกณฑ์ดีเยี่ยมและสดใส ยอดเยี่ยมมาก! อย่าลืมรักษาพลังบวกและพักผ่อนให้เพียงพอนะ';
            } else if (numAvg >= 3.0) {
                insight = 'ช่วง ' + days + ' วันนี้ อารมณ์ของคุณอยู่ในเกณฑ์ปกติ มีวันที่สบายใจสลับกับวันที่เหนื่อยบ้าง ลองหากิจกรรมผ่อนคลายเติมพลังใจดูนะ';
            } else {
                insight = 'ช่วง ' + days + ' วันนี้ คุณอาจกำลังเผชิญกับวันที่เหนื่อยล้าหรือมีความเครียดสะสม ให้เวลากับตัวเองช้าลง พักผ่อน และลองทำกิจกรรม Self-care ดูนะ คนเก่ง!';
            }

            if (topFactors.length > 0) {
                insight += ' ปัจจัยที่เกี่ยวข้องกับความรู้สึกของคุณบ่อยที่สุดคือ "' + topFactors[0].name + '"';
            }
        }

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            period,
            summary: {
                total_entries: entryCount,
                average_mood: avgMood,
                average_stress: avgStress
            },
            trend,
            distribution,
            top_factors: topFactors,
            insight
        };
        node.send(msg);
    } catch (err) {
        node.error('Analytics error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูลสถิติ' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_analytics', 'GET', '/api/analytics/moods', 'Get Mood Analytics', analyticsCode, 150);

// -------------------------------------------------------------
// TAB 4: SELF-CARE ACTIVITIES
// -------------------------------------------------------------

// GET /api/activities
const getActivitiesCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    try {
        const userId = auth.user.id;
        const [rows] = await pool.execute(
            \`SELECT 
                a.id, 
                a.title, 
                a.description, 
                a.category,
                (SELECT COUNT(*) FROM user_activity_logs l 
                 WHERE l.activity_id = a.id AND l.user_id = ? AND DATE(l.completed_at) = CURRENT_DATE()) > 0 as completed_today
             FROM self_care_activities a
             ORDER BY a.id ASC\`,
            [userId]
        );

        const activities = rows.map(r => ({
            ...r,
            completed_today: Boolean(r.completed_today)
        }));

        msg.statusCode = 200;
        msg.payload = { success: true, data: activities };
        node.send(msg);
    } catch (err) {
        node.error('Get activities error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'ไม่สามารถดึงข้อมูลกิจกรรมดูแลตัวเองได้' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_activities', 'GET', '/api/activities', 'Get Activities', getActivitiesCode, 120);

// POST /api/activities/:id/complete
const completeActivityCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
const activityId = parseInt(msg.req.params.id, 10);

(async () => {
    try {
        if (isNaN(activityId)) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'รหัสกิจกรรมไม่ถูกต้อง' };
            node.send(msg);
            return;
        }

        const [act] = await pool.execute('SELECT id, title FROM self_care_activities WHERE id = ? LIMIT 1', [activityId]);
        if (act.length === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบกิจกรรมที่ระบุ' };
            node.send(msg);
            return;
        }

        // Insert log
        await pool.execute(
            'INSERT INTO user_activity_logs (user_id, activity_id) VALUES (?, ?)',
            [auth.user.id, activityId]
        );

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            message: 'บันทึกการทำกิจกรรม "' + act[0].title + '" สำเร็จ เก่งมากที่ให้เวลาดูแลตัวเอง!'
        };
        node.send(msg);
    } catch (err) {
        node.error('Complete activity error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกกิจกรรม' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_activities', 'POST', '/api/activities/:id/complete', 'Complete Activity', completeActivityCode, 240);

// GET /api/activities/history
const getActivityHistoryCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    try {
        const [rows] = await pool.execute(
            \`SELECT 
                l.id, 
                l.completed_at, 
                a.title, 
                a.category 
             FROM user_activity_logs l
             JOIN self_care_activities a ON l.activity_id = a.id
             WHERE l.user_id = ?
             ORDER BY l.completed_at DESC
             LIMIT 30\`,
            [auth.user.id]
        );

        msg.statusCode = 200;
        msg.payload = { success: true, data: rows };
        node.send(msg);
    } catch (err) {
        node.error('Activity history error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'ไม่สามารถดึงประวัติการทำกิจกรรมได้' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_activities', 'GET', '/api/activities/history', 'Activity History', getActivityHistoryCode, 360);

// -------------------------------------------------------------
// TAB 5: PROFILE & ACCOUNT
// -------------------------------------------------------------

// GET /api/profile
const getProfileCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    try {
        const userId = auth.user.id;

        // User profile
        const [users] = await pool.execute(
            'SELECT id, display_name, email, student_id, created_at FROM users WHERE id = ? LIMIT 1',
            [userId]
        );

        if (users.length === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบผู้ใช้ในระบบ' };
            node.send(msg);
            return;
        }

        const user = users[0];

        // Total entries
        const [entryCount] = await pool.execute('SELECT COUNT(*) as total FROM mood_entries WHERE user_id = ?', [userId]);
        // Total completed activities
        const [actCount] = await pool.execute('SELECT COUNT(*) as total FROM user_activity_logs WHERE user_id = ?', [userId]);
        // Latest mood
        const [latestMood] = await pool.execute(
            \`SELECT DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, mood_score, mood_label 
             FROM mood_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT 1\`,
            [userId]
        );

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            data: {
                ...user,
                stats: {
                    total_entries: entryCount[0].total,
                    total_activities: actCount[0].total,
                    latest_mood: latestMood.length > 0 ? latestMood[0] : null
                }
            }
        };
        node.send(msg);
    } catch (err) {
        node.error('Get profile error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_profile', 'GET', '/api/profile', 'Get Profile', getProfileCode, 120);

// PUT /api/profile
const putProfileCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    try {
        const userId = auth.user.id;
        const body = msg.payload || {};
        const { display_name, student_id } = body;

        if (!display_name || !display_name.trim()) {
            msg.statusCode = 400;
            msg.payload = { success: false, message: 'กรุณาระบุชื่อที่ใช้แสดง' };
            node.send(msg);
            return;
        }

        const cleanName = display_name.trim();
        const cleanStudentId = student_id ? student_id.trim() : null;

        await pool.execute(
            'UPDATE users SET display_name = ?, student_id = ? WHERE id = ?',
            [cleanName, cleanStudentId, userId]
        );

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            message: 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว',
            user: {
                id: userId,
                display_name: cleanName,
                student_id: cleanStudentId
            }
        };
        node.send(msg);
    } catch (err) {
        node.error('Put profile error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_profile', 'PUT', '/api/profile', 'Update Profile', putProfileCode, 240);

// DELETE /api/account
const deleteAccountCode = `
const auth = global.get('authenticateUser')(msg);
if (auth.error) {
    msg.statusCode = 401;
    msg.payload = { success: false, message: auth.error };
    return msg;
}

const pool = global.get('dbPool');
(async () => {
    try {
        const userId = auth.user.id;

        // Cascade delete will delete mood_entries, entry_factors, user_activity_logs automatically via MySQL FK
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            msg.statusCode = 404;
            msg.payload = { success: false, message: 'ไม่พบผู้ใช้ในระบบ' };
            node.send(msg);
            return;
        }

        msg.statusCode = 200;
        msg.payload = {
            success: true,
            message: 'ลบบัญชีและข้อมูลประวัติสุขภาพใจทั้งหมดของคุณเรียบร้อยแล้วอย่างปลอดภัย'
        };
        node.send(msg);
    } catch (err) {
        node.error('Delete account error: ' + err.message);
        msg.statusCode = 500;
        msg.payload = { success: false, message: 'เกิดข้อผิดพลาดในการลบบัญชี' };
        node.send(msg);
    }
})();
`;
createApiRoute('tab_profile', 'DELETE', '/api/account', 'Delete Account', deleteAccountCode, 360);

// Write to backend/flows.json
const outputPath = path.join(__dirname, 'backend', 'flows.json');
fs.writeFileSync(outputPath, JSON.stringify(nodes, null, 2), 'utf-8');
console.log('flows.json generated successfully with ' + nodes.length + ' nodes at ' + outputPath);
