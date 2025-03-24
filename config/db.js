import { neon } from '@neondatabase/serverless';
import logger from './logger.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

export async function query(text, params) {
    try {
        const result = await sql(text, params);
        return result;
    } catch (error) {
        logger.error('Database query error:', error);
        throw error;
    }
}

export async function initializeDatabase() {
    try {
        // Create tables if they don't exist
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                class VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS teachers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                subject VARCHAR(100) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS classes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                teacher_id INTEGER REFERENCES teachers(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id),
                class_id INTEGER REFERENCES classes(id),
                date DATE NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS grades (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id),
                class_id INTEGER REFERENCES classes(id),
                subject VARCHAR(100) NOT NULL,
                grade DECIMAL(5,2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        logger.info('Database initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
    }
}

export default sql; 