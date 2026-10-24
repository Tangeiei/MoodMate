@echo off
setlocal

echo ==============================================
echo  MoodMate - Database Restore Script (Windows)
echo ==============================================

if "%~1"=="" (
    echo [ERR] Please specify backup SQL file to restore!
    echo Usage: scripts\restore-db.bat backup\your_backup_file.sql
    goto :end
)

set BACKUP_FILE=%~1

if not exist "%BACKUP_FILE%" (
    echo [ERR] File not found: %BACKUP_FILE%
    goto :end
)

echo [!] WARNING: This will overwrite the current 'moodmate_db' database!
set /p CONFIRM="Are you sure you want to proceed? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [INFO] Restore cancelled.
    goto :end
)

echo [*] Restoring database from %BACKUP_FILE%...
docker exec -i moodmate-mysql mysql -u root -pmoodmate_root_secure_2025 moodmate_db < "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [OK] Database restored successfully!
) else (
    echo [ERR] Failed to restore database!
)

:end
pause
