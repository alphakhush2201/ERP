import jwt from 'jsonwebtoken';
import { query } from '../../utils/db.js';
import 'dotenv/config';

// Helper function to verify token
const verifyToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    return null;
  }
};

export default async function handler(req, res) {
  // Verify token
  const user = verifyToken(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // GET all fees
  if (req.method === 'GET') {
  console.log('GET /api/fees called');
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const grade = req.query.grade || '';
    const status = req.query.status || '';
  
    // Build the query
    let sqlQuery = `
      SELECT f.*, s.student_id, CONCAT(s.first_name, ' ', s.last_name) as student_name, s.grade
      FROM fees f
      JOIN students s ON f.student_id = s.id
      WHERE 1=1
    `;
  
    const queryParams = [];
  
  if (search) {
    query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ?)`;
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  if (grade) {
    query += ` AND s.grade = ?`;
    queryParams.push(grade);
  }
  
  if (status) {
    query += ` AND f.status = ?`;
    queryParams.push(status);
  }
  
  // Count total fees
  const countQuery = query.replace('f.*, s.student_id, s.first_name || \' \' || s.last_name as student_name, s.grade', 'COUNT(*) as count');
  
  db.get(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const total = countResult ? countResult.count : 0;
    
    // Add pagination
    query += ` ORDER BY f.due_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    db.all(query, queryParams, (err, fees) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get summary data
      getSummaryData(db, (err, summary) => {
        if (err) {
          console.error('Error getting summary data:', err);
          summary = {
            totalCollected: 0,
            pendingAmount: 0,
            overdueAmount: 0,
            studentsPaid: 0,
            totalStudents: 0
          };
        }
        
        res.json({
          fees,
          total,
          summary
        });
        
        db.close();
      });
    });
  });
});

// POST new fee
router.post('/', verifyToken, (req, res) => {
  console.log('POST /api/fees called with body:', req.body);
  
  const { studentId, feeType, amount, dueDate, paymentDate, paymentMethod, notes, status } = req.body;
  
  // Validate required fields
  if (!studentId || !feeType || !amount || !dueDate || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const db = new sqlite3.Database(dbPath);
  
  // Check if fees table exists, create if not
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
      console.error('Error creating fees table:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Insert the fee
    db.run(`
      INSERT INTO fees (student_id, fee_type, amount, due_date, payment_date, payment_method, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, feeType, amount, dueDate, paymentDate, paymentMethod, notes, status], function(err) {
      if (err) {
        console.error('Error inserting fee:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Fee recorded successfully'
      });
      
      db.close();
    });
  });
});

// Helper function to get summary data
function getSummaryData(db, callback) {
  db.get(`SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'paid'`, (err, totalCollectedResult) => {
    if (err) return callback(err);
    
    db.get(`SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'pending'`, (err, pendingAmountResult) => {
      if (err) return callback(err);
      
      db.get(`SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'overdue'`, (err, overdueAmountResult) => {
        if (err) return callback(err);
        
        db.get(`SELECT COUNT(DISTINCT student_id) as count FROM fees WHERE status = 'paid'`, (err, studentsPaidResult) => {
          if (err) return callback(err);
          
          db.get(`SELECT COUNT(id) as count FROM students`, (err, totalStudentsResult) => {
            if (err) return callback(err);
            
            const summary = {
              totalCollected: totalCollectedResult.total,
              pendingAmount: pendingAmountResult.total,
              overdueAmount: overdueAmountResult.total,
              studentsPaid: studentsPaidResult.count,
              totalStudents: totalStudentsResult.count
            };
            
            callback(null, summary);
          });
        });
      });
    });
  });
}

module.exports = router;