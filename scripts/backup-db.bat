@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo  MoodMate - Database Backup Script (Windows)
echo ==============================================

if not exist "backup" mkdir backup

for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set BACKUP_FILE=backup\moodmate_backup_%TIMESTAMP%.sql

echo [*] Starting backup from container 'moodmate-mysql'...
docker exec moodmate-mysql /usr/bin/mysqldump -u root -pmoodmate_root_secure_2025 moodmate_db > "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [OK] Backup created successfully: %BACKUP_FILE%
) else (
    echo [ERR] Failed to create backup! Make sure docker is running.
)

pause
