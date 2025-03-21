const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

async function getDbConnection() {
    try {
        const db = await open({
            filename: process.env.NODE_ENV === 'production' 
                ? ':memory:'  // Use in-memory database for production
                : path.join(process.cwd(), 'database.sqlite'), // Local development
            driver: sqlite3.Database
        });
        
        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');
        
        return db;
    } catch (error) {
        console.error('Database connection error:', error);
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

module.exports = getDb; 