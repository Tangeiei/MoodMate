/**
 * Node-RED Settings for MoodMate Backend
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    // Port to listen on
    uiPort: process.env.PORT || 1880,

    // Admin UI (Editor) configuration
    // When NODE_RED_ENABLE_EDITOR is 'false', disable editor for production security
    httpAdminRoot: process.env.NODE_RED_ENABLE_EDITOR === 'false' ? false : '/admin',

    // Node HTTP Root for API endpoints
    httpNodeRoot: '/',

    // Enable CORS for API requests
    httpNodeCors: {
        origin: "*",
        methods: "GET,PUT,POST,DELETE,OPTIONS",
        allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept"
    },

    // User directory for flows and configuration
    userDir: process.env.NODE_RED_USER_DIR || __dirname,

    // Flow file name
    flowFile: 'flows.json',
    flowFilePretty: true,

    // Enable external modules in function nodes
    functionExternalModules: true,

    // Global context modules available to all function nodes
    functionGlobalContext: {
        mysql: mysql,
        bcrypt: bcrypt,
        jwt: jwt,
        env: {
            DB_HOST: process.env.DB_HOST || '127.0.0.1',
            DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
            DB_USER: process.env.DB_USER || 'moodmate_user',
            DB_PASSWORD: process.env.DB_PASSWORD || 'moodmate_secure_pass',
            DB_NAME: process.env.DB_NAME || 'moodmate_db',
            JWT_SECRET: process.env.JWT_SECRET || 'moodmate_super_secret_jwt_key_2025_student_secure',
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
        }
    },

    // Logging configuration
    logging: {
        console: {
            level: process.env.LOG_LEVEL || "info",
            metrics: false,
            audit: false
        }
    },

    // Security & Limits
    apiMaxLength: '5mb'
};
