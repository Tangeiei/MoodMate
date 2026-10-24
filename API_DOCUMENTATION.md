# MoodMate REST API Documentation

ระบบ REST API สำหรับแอปพลิเคชัน MoodMate พัฒนาด้วย Node-RED เชื่อมต่อฐานข้อมูล MySQL และรักษาความปลอดภัยด้วย JSON Web Token (JWT)

- **Base URL (Local/Docker):** `http://localhost:8080/api` (ผ่าน Nginx Reverse Proxy) หรือ `http://localhost:1880/api` (ตรงไปยัง Node-RED)
- **Header ที่จำเป็นสำหรับ Protected Endpoints:** `Authorization: Bearer <TOKEN>`
- **Response Format:** JSON เสมอ

---

## 1. Authentication (ระบบยืนยันตัวตน)

### 1.1 สมัครสมาชิกใหม่
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Request Body:**
```json
{
  "display_name": "สมชาย ใจดี",
  "email": "somchai@university.ac.th",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "student_id": "64010123",
  "privacy_accepted": true
}
```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ MoodMate",
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "display_name": "สมชาย ใจดี",
        "email": "somchai@university.ac.th",
        "student_id": "64010123"
      }
    }
    ```
  - `400 Bad Request`: ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้องตามกติกา
  - `409 Conflict`: อีเมลนี้ถูกลงทะเบียนไว้แล้วในระบบ

---

### 1.2 เข้าสู่ระบบ
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Request Body:**
```json
{
  "email": "somchai@university.ac.th",
  "password": "Password123!"
}
```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "เข้าสู่ระบบสำเร็จ",
      "token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "display_name": "สมชาย ใจดี",
        "email": "somchai@university.ac.th",
        "student_id": "64010123"
      }
    }
    ```
  - `401 Unauthorized`: อีเมลหรือรหัสผ่านไม่ถูกต้อง

---

### 1.3 ออกจากระบบ
- **Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "ออกจากระบบสำเร็จ" }`

---

### 1.4 ดึงข้อมูลผู้ใช้ปัจจุบัน (Current Session)
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "display_name": "สมชาย ใจดี",
        "email": "somchai@university.ac.th",
        "student_id": "64010123",
        "created_at": "2026-10-24T08:00:00.000Z"
      }
    }
    ```
  - `401 Unauthorized`: Token หมดอายุหรือไม่ถูกต้อง

---

## 2. Mood Entries (การบันทึกอารมณ์)

### 2.1 ดึงรายการปัจจัยอารมณ์ Master Data
- **Method:** `GET`
- **Endpoint:** `/api/moods/factors`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "การเรียน / เลกเชอร์" },
        { "id": 2, "name": "การสอบ / โปรเจกต์" },
        { "id": 3, "name": "ครอบครัว" }
      ]
    }
    ```

---

### 2.2 ค้นหาและดูประวัติบันทึกอารมณ์ (พร้อมกรองและแบ่งหน้า)
- **Method:** `GET`
- **Endpoint:** `/api/moods`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Query Parameters:**
  - `start_date` (ตัวเลือก): วันที่เริ่มต้น (YYYY-MM-DD)
  - `end_date` (ตัวเลือก): วันที่สิ้นสุด (YYYY-MM-DD)
  - `mood_score` (ตัวเลือก): คะแนน 1 ถึง 5
  - `factor_id` (ตัวเลือก): รหัสปัจจัยที่ต้องการกรอง
  - `page` (ตัวเลือก, ค่าเริ่มต้น 1): เลขหน้า
  - `limit` (ตัวเลือก, ค่าเริ่มต้น 10): จำนวนรายการต่อหน้า
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 10,
          "entry_date": "2026-10-24",
          "mood_score": 4,
          "mood_label": "ดี",
          "stress_level": 2,
          "journal_text": "วันนี้ทำการบ้านเสร็จสบายใจ",
          "factor_names": ["การเรียน / เลกเชอร์"],
          "factor_ids": [1]
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    }
    ```

---

### 2.3 สร้างบันทึกอารมณ์ใหม่
- **Method:** `POST`
- **Endpoint:** `/api/moods`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "entry_date": "2026-10-24",
  "mood_score": 5,
  "mood_label": "ดีมาก",
  "stress_level": 1,
  "journal_text": "วันนี้มีความสุขมาก!",
  "factor_ids": [1, 9]
}
```
- **Responses:**
  - `201 Created`: `{ "success": true, "message": "บันทึกอารมณ์เรียบร้อยแล้ว...", "id": 11 }`
  - `409 Conflict`: มีบันทึกของวันที่ระบุอยู่แล้ว (ระบบป้องกันการบันทึกซ้ำวันเดียวกัน)

---

### 2.4 ดึงข้อมูลบันทึกอารมณ์ตาม ID
- **Method:** `GET`
- **Endpoint:** `/api/moods/:id`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`: ข้อมูลบันทึกพร้อมปัจจัย
  - `404 Not Found`: ไม่พบบันทึก หรือผู้ใช้ไม่มีสิทธิ์เข้าถึง (Data Isolation)

---

### 2.5 แก้ไขบันทึกอารมณ์
- **Method:** `PUT`
- **Endpoint:** `/api/moods/:id`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Request Body:** เหมือนการสร้างบันทึกใหม่
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "แก้ไขบันทึกอารมณ์สำเร็จ" }`
  - `404 Not Found`: ไม่พบหรือไม่มีสิทธิ์แก้ไข

---

### 2.6 ลบบันทึกอารมณ์
- **Method:** `DELETE`
- **Endpoint:** `/api/moods/:id`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "ลบบันทึกอารมณ์เรียบร้อยแล้ว" }`

---

## 3. Analytics (สถิติและแนวโน้ม)

### 3.1 ดึงข้อมูลสรุปสถิติอารมณ์
- **Method:** `GET`
- **Endpoint:** `/api/analytics/moods?period=7d` (หรือ `period=30d`)
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "period": "7d",
      "summary": {
        "total_entries": 5,
        "average_mood": "4.2",
        "average_stress": "1.8"
      },
      "trend": [
        { "date": "2026-10-20", "mood_score": 4, "mood_label": "ดี", "stress_level": 2 }
      ],
      "distribution": { "1": 0, "2": 0, "3": 1, "4": 3, "5": 1 },
      "top_factors": [
        { "id": 1, "name": "การเรียน / เลกเชอร์", "count": 4 }
      ],
      "insight": "ช่วง 7 วันนี้ อารมณ์ของคุณอยู่ในเกณฑ์ดีเยี่ยมและสดใส..."
    }
    ```

---

## 4. Self-care Activities (กิจกรรมดูแลใจ)

### 4.1 ดึงรายการกิจกรรมทั้งหมดพร้อมสถานะทำแล้ววันนี้
- **Method:** `GET`
- **Endpoint:** `/api/activities`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`: รายการกิจกรรมพร้อมฟิลด์ `completed_today: boolean`

---

### 4.2 บันทึกว่าทำกิจกรรมสำเร็จ
- **Method:** `POST`
- **Endpoint:** `/api/activities/:id/complete`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "บันทึกการทำกิจกรรมสำเร็จ..." }`

---

### 4.3 ดูประวัติการทำกิจกรรมย้อนหลัง
- **Method:** `GET`
- **Endpoint:** `/api/activities/history`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`: รายการประวัติกิจกรรมล่าสุด 30 รายการ

---

## 5. Profile & Account (โปรไฟล์และความเป็นส่วนตัว)

### 5.1 ดูข้อมูลโปรไฟล์และสถิติภาพรวม
- **Method:** `GET`
- **Endpoint:** `/api/profile`
- **Header:** `Authorization: Bearer <TOKEN>`

### 5.2 แก้ไขชื่อแสดงผลและรหัสนักศึกษา
- **Method:** `PUT`
- **Endpoint:** `/api/profile`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Request Body:** `{ "display_name": "ชื่อใหม่", "student_id": "64010999" }`

### 5.3 ลบบัญชีผู้ใช้และข้อมูลทั้งหมด (Cascade Deletion)
- **Method:** `DELETE`
- **Endpoint:** `/api/account`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Responses:**
  - `200 OK`: `{ "success": true, "message": "ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้วอย่างปลอดภัย" }`
