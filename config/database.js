import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from './logger.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getDbConnection() {
    try {
        // In production, use a file in /tmp which is writable in Vercel
        const dbPath = process.env.NODE_ENV === 'production'
            ? path.join('/tmp', 'database.sqlite')
            : path.join(process.cwd(), 'database.sqlite');

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        
        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');
        
        // Initialize tables if they don't exist
        await initializeTables(db);
        
        logger.info(`Database connected at ${dbPath}`);
        return db;
    } catch (error) {
        logger.error('Database connection error:', error);
        throw error;
    }
}

async function initializeTables(db) {
    try {
        // Create users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create students table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE,
                grade TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        logger.info('Database tables initialized successfully');
    } catch (error) {
        logger.error('Error initializing database tables:', error);
        throw error;
    }
}

// Export a singleton instance
let dbInstance = null;

async function getDb() {
    if (!dbInstance) {
        dbInstance = await getDbConnection();
    }
    return dbInstance;
}

export default getDb; 