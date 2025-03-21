const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Create fees table if it doesn't exist
db.serialize(() => {
  db.run(`
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `, function(err) {
    if (err) {
      console.error('Error creating fees table:', err.message);
      return;
    }
    console.log('Fees table created or already exists.');
    
    // Check if students table exists and has data
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='students'`, (err, table) => {
      if (err) {
        console.error('Error checking students table:', err.message);
        db.close();
        return;
      }
      
      if (!table) {
        console.error('Students table does not exist. Please create it first.');
        db.close();
        return;
      }
      
      // Get all students from the database
      db.all(`SELECT * FROM students`, [], (err, students) => {
        if (err) {
          console.error('Error querying students:', err.message);
          db.close();
          return;
        }
        
        if (students.length === 0) {
          console.log('No students found in the database. Please add students first.');
          db.close();
          return;
        }
        
        console.log(`Found ${students.length} students in the database:`);
        students.forEach(student => {
          console.log(`${student.student_id}: ${student.first_name} ${student.last_name} (${student.grade})`);
        });
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    });
  });
});