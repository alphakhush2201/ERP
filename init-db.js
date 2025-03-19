const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

async function initializeDatabase() {
  // Database path
  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  
  // Create a new database connection
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Promisify db.run and db.get
    const run = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve(this);
        });
      });
    };
    
    const get = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });
    };
    
    // Create teachers table
    await run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        join_date TEXT NOT NULL,
        last_login TEXT,
        is_active INTEGER DEFAULT 1
      )
    `);
    
    // Create students table
    await run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    await run(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    await run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        due_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);
    
    // Create announcements table
    await run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES teachers(id)
      )
    `);
    
    // Create fees table
    await run(`
      CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        fee_type TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        payment_date TEXT,
        payment_method TEXT,
        notes TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);
    
    // Check if admin user exists
    const adminExists = await get('SELECT id FROM teachers WHERE username = ?', ['admin']);
    
    if (!adminExists) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await run(
        'INSERT INTO teachers (username, password, first_name, last_name, email, join_date) VALUES (?, ?, ?, ?, ?, datetime("now"))',
        ['admin', hashedPassword, 'Admin', 'User', 'admin@masteracademy.com']
      );
      console.log('Default admin user created');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

initializeDatabase().catch(console.error);