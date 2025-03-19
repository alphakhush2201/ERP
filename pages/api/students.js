const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

module.exports = async function handler(req, res) {
  console.log('Students API called with method:', req.method);
  
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Create a new database connection
    const db = new sqlite3.Database(dbPath);
    
    // Promisify db functions
    const all = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    };
    
    try {
      // Handle GET request - fetch students
      if (req.method === 'GET') {
        console.log('Fetching students from database');
        
        // Check if students table exists
        const tableExists = await all(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='students'`
        );
        
        if (tableExists.length === 0) {
          console.error('Students table does not exist');
          return res.status(500).json({ error: 'Students table does not exist' });
        }
        
        const students = await all(`
          SELECT id, student_id, first_name, last_name, grade
          FROM students
          ORDER BY grade, last_name, first_name
        `);
        
        console.log(`Found ${students.length} students`);
        
        res.status(200).json({
          students
        });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
      
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};