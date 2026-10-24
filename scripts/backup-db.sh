#!/usr/bin/env bash
# MoodMate - Database Backup Script (Linux/macOS)
set -e

mkdir -p backup
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="backup/moodmate_backup_${TIMESTAMP}.sql"

echo "[*] Creating backup from 'moodmate-mysql' container..."
docker exec moodmate-mysql /usr/bin/mysqldump -u root -pmoodmate_root_secure_2025 moodmate_db > "${BACKUP_FILE}"

echo "[OK] Backup saved to: ${BACKUP_FILE}"
