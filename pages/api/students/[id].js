const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

module.exports = async function handler(req, res) {
  // Get student ID from the URL
  const studentId = req.query.id;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Create a new database connection
    const db = new sqlite3.Database(dbPath);
    
    // Promisify db functions
    const get = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });
    };
    
    const run = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve(this);
        });
      });
    };
    
    try {
      // Handle GET request - fetch student details
      if (req.method === 'GET') {
        const student = await get('SELECT * FROM students WHERE id = ?', [studentId]);
        
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        res.status(200).json(student);
      }
      // Handle PUT request - update student
      else if (req.method === 'PUT') {
        // Check if student exists
        const student = await get('SELECT * FROM students WHERE id = ?', [studentId]);
        
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        // Validate required fields
        const requiredFields = [
          'first_name', 'last_name', 'date_of_birth', 
          'gender', 'grade', 'section', 'admission_date', 
          'parent_name', 'parent_relationship', 'parent_email', 
          'parent_phone', 'address'
        ];
        
        for (const field of requiredFields) {
          if (!req.body[field]) {
            return res.status(400).json({ error: `${field} is required` });
          }
        }
        
        // Update student
        await run(
          `UPDATE students SET 
            first_name = ?, 
            last_name = ?, 
            date_of_birth = ?, 
            gender = ?, 
            grade = ?, 
            section = ?, 
            admission_date = ?, 
            previous_school = ?, 
            parent_name = ?, 
            parent_relationship = ?, 
            parent_email = ?, 
            parent_phone = ?, 
            address = ?
          WHERE id = ?`,
          [
            req.body.first_name,
            req.body.last_name,
            req.body.date_of_birth,
            req.body.gender,
            req.body.grade,
            req.body.section,
            req.body.admission_date,
            req.body.previous_school,
            req.body.parent_name,
            req.body.parent_relationship,
            req.body.parent_email,
            req.body.parent_phone,
            req.body.address,
            studentId
          ]
        );
        
        res.status(200).json({ 
          message: 'Student updated successfully',
          id: studentId
        });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error('Student API error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};