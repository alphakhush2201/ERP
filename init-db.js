import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import logger from './config/logger.js';

async function initializeDatabase() {
  // Create a PostgreSQL client
  const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // Connect to the database
    await client.connect();
    logger.info('Connected to Neon PostgreSQL database');
    
    // Create teachers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        join_date TIMESTAMP NOT NULL,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    
    // Create students table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        grade TEXT NOT NULL,
        section TEXT NOT NULL,
        admission_date TEXT NOT NULL,
        previous_school TEXT,
        parent_name TEXT NOT NULL,
        parent_relationship TEXT NOT NULL,
        parent_email TEXT NOT NULL,
        parent_phone TEXT NOT NULL,
        address TEXT NOT NULL
      )
    `);
    
    // Create classes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        teacher_id INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      )
    `);
    
    // Create assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        due_date TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);
    
    // Create announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL,
        FOREIGN KEY (created_by) REFERENCES teachers(id)
      )
    `);
    
    // Create fees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        fee_type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date TEXT NOT NULL,
        payment_date TEXT,
        payment_method TEXT,
        notes TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);
    
    // Check if admin user exists
    const adminResult = await client.query('SELECT id FROM teachers WHERE username = $1', ['admin']);
    
    if (adminResult.rows.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO teachers (username, password, first_name, last_name, email, join_date) VALUES ($1, $2, $3, $4, $5, NOW())',
        ['admin', hashedPassword, 'Admin', 'User', 'admin@masteracademy.com']
      );
      logger.info('Default admin user created');
    }
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

initializeDatabase().catch(error => logger.error('Initialization failed:', error));