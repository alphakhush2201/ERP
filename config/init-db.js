const getDb = require('./database');
const logger = require('./logger');

async function initializeDatabase() {
    try {
        const db = await getDb();
        
        // Create tables if they don't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                class TEXT NOT NULL,
                roll_number TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS fees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students(id)
            );
        `);

        logger.info('Database initialized successfully');
    } catch (error) {
        logger.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = initializeDatabase; 