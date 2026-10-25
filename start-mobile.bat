@echo off
title MoodMate - Mobile Tunnel
color 0b
cd /d "%~dp0"

if exist "scripts\start-mobile-tunnel.js" (
    node scripts\start-mobile-tunnel.js
) else (
    echo [*] Starting Cloudflare Tunnel...
    tools\cloudflared.exe tunnel --url http://localhost:8080
)

pause
