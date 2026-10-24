-- MoodMate Database Schema
-- UTF-8 mb4 for full Thai language and Emoji support

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_activity_logs`;
DROP TABLE IF EXISTS `self_care_activities`;
DROP TABLE IF EXISTS `entry_factors`;
DROP TABLE IF EXISTS `mood_factors`;
DROP TABLE IF EXISTS `mood_entries`;
DROP TABLE IF EXISTS `users`;

-- 1. users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `display_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `student_id` VARCHAR(50) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. mood_entries table
CREATE TABLE `mood_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `entry_date` DATE NOT NULL,
  `mood_score` TINYINT NOT NULL CHECK (`mood_score` BETWEEN 1 AND 5),
  `mood_label` VARCHAR(50) NOT NULL,
  `stress_level` TINYINT NULL CHECK (`stress_level` IS NULL OR `stress_level` BETWEEN 1 AND 5),
  `journal_text` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mood_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `uq_user_entry_date` UNIQUE (`user_id`, `entry_date`),
  INDEX `idx_mood_user_date` (`user_id`, `entry_date`),
  INDEX `idx_mood_score` (`mood_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. mood_factors master table
CREATE TABLE `mood_factors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `is_active` BOOLEAN DEFAULT TRUE,
  INDEX `idx_factors_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. entry_factors relation table
CREATE TABLE `entry_factors` (
  `mood_entry_id` INT NOT NULL,
  `factor_id` INT NOT NULL,
  PRIMARY KEY (`mood_entry_id`, `factor_id`),
  CONSTRAINT `fk_ef_entry` FOREIGN KEY (`mood_entry_id`) REFERENCES `mood_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ef_factor` FOREIGN KEY (`factor_id`) REFERENCES `mood_factors` (`id`) ON DELETE RESTRICT,
  INDEX `idx_ef_factor` (`factor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. self_care_activities master table
CREATE TABLE `self_care_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. user_activity_logs table
CREATE TABLE `user_activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `activity_id` INT NOT NULL,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_actlog_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_actlog_activity` FOREIGN KEY (`activity_id`) REFERENCES `self_care_activities` (`id`) ON DELETE CASCADE,
  INDEX `idx_actlog_user_date` (`user_id`, `completed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
