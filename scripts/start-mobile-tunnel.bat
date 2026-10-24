@echo off
echo ========================================================
echo  MoodMate - Start Mobile Tunnel (Cloudflare)
echo ========================================================
echo.
echo [*] Starting tunnel to local port 8080...
echo [*] Please copy the HTTPS URL below to open on mobile:
echo.

tools\cloudflared.exe tunnel --url http://localhost:8080

pause
