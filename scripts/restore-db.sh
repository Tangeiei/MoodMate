#!/usr/bin/env bash
# MoodMate - Database Restore Script (Linux/macOS)
set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./scripts/restore-db.sh backup/your_backup_file.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' does not exist."
    exit 1
fi

echo "WARNING: This will overwrite data in 'moodmate_db'."
read -p "Are you sure you want to proceed? (y/N): " confirm
if [[ "$confirm" != [yY] ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo "[*] Restoring database from $BACKUP_FILE..."
docker exec -i moodmate-mysql mysql -u root -pmoodmate_root_secure_2025 moodmate_db < "$BACKUP_FILE"

echo "[OK] Restore completed successfully!"
