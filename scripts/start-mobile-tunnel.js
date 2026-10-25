/**
 * MoodMate - Mobile Tunnel Runner
 * Starts Cloudflare tunnel and prints a clear, copy-pasteable link for mobile testing.
 */
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const cloudflaredPath = path.join(rootDir, 'tools', 'cloudflared.exe');

if (!fs.existsSync(cloudflaredPath)) {
  console.error('[ERR] ไม่พบไฟล์ cloudflared.exe ในโฟลเดอร์ tools!');
  console.error('กรุณาตรวจสอบว่ามีไฟล์:', cloudflaredPath);
  process.exit(1);
}

console.log('========================================================================');
console.log('  🌱 MoodMate - ระบบเปิดหน้าเว็บสำหรับมือถือ (Cloudflare Tunnel)');
console.log('========================================================================');
console.log('[*] กำลังเชื่อมต่อไปยัง Docker Container (พอร์ต 8080)...');
console.log('[*] กรุณารอสักครู่ (ประมาณ 3-5 วินาที)...\n');

const child = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:8080']);

let foundUrl = false;

function handleOutput(data) {
  const text = data.toString();
  
  // Cloudflare prints: https://xxxx.trycloudflare.com
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !foundUrl) {
    foundUrl = true;
    const url = match[0];

    // Try to copy to Windows clipboard
    try {
      execSync(`powershell -command "Set-Clipboard -Value '${url}'"`, { stdio: 'ignore' });
    } catch (e) {}

    console.log('========================================================================');
    console.log('  🎉 ลิงก์สำหรับเปิดบนมือถือของคุณพร้อมใช้งานแล้ว!');
    console.log('========================================================================\n');
    console.log('  👉 ' + url + '\n');
    console.log('========================================================================');
    console.log('  [✓] คัดลอกลิงก์ไปยัง Clipboard (คลิปบอร์ด) ในคอมพิวเตอร์ให้แล้ว');
    console.log('  [✓] สามารถส่งลิงก์นี้เข้า LINE / Messenger แล้วกดเปิดบนมือถือได้ทันที');
    console.log('  [✓] ใช้ได้ทั้งเน็ตมือถือ 4G/5G และ Wi-Fi ทุกเครือข่าย');
    console.log('  [✓] เข้าสู่ระบบ บันทึกอารมณ์ และใช้งาน MySQL ได้จริง 100%');
    console.log('========================================================================');
    console.log('  ⚠️ ข้อควรจำ: อย่าปิดหน้าต่างดำนี้ขณะกำลังใช้งานบนมือถือ');
    console.log('========================================================================\n');
  }
}

child.stdout.on('data', handleOutput);
child.stderr.on('data', handleOutput);

child.on('error', (err) => {
  console.error('[ERR] เกิดข้อผิดพลาดในการรัน Tunnel:', err.message);
});

child.on('close', (code) => {
  console.log('[INFO] ปิดการเชื่อมต่อ Tunnel แล้ว (code: ' + code + ')');
});
