const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

module.exports = async function handler(req, res) {
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const { id } = req.query;
  
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
      // Handle GET request - fetch fee details
      if (req.method === 'GET') {
        const fee = await get(
          `SELECT f.*, s.student_id, s.first_name || ' ' || s.last_name as student_name, s.grade
           FROM fees f
           JOIN students s ON f.student_id = s.id
           WHERE f.id = ?`,
          [id]
        );
        
        if (!fee) {
          return res.status(404).json({ error: 'Fee not found' });
        }
        
        res.status(200).json(fee);
      }
      // Handle PUT request - update fee
      else if (req.method === 'PUT') {
        // Check if fee exists
        const fee = await get('SELECT * FROM fees WHERE id = ?', [id]);
        
        if (!fee) {
          return res.status(404).json({ error: 'Fee not found' });
        }
        
        // Update fee
        await run(
          `UPDATE fees SET
           fee_type = COALESCE(?, fee_type),
           amount = COALESCE(?, amount),
           due_date = COALESCE(?, due_date),
           payment_date = COALESCE(?, payment_date),
           payment_method = COALESCE(?, payment_method),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status),
           updated_at = datetime('now')
           WHERE id = ?`,
          [
            req.body.feeType,
            req.body.amount,
            req.body.dueDate,
            req.body.paymentDate,
            req.body.paymentMethod,
            req.body.notes,
            req.body.status,
            id
          ]
        );
        
        res.status(200).json({ message: 'Fee updated successfully' });
      }
      // Handle DELETE request - delete fee
      else if (req.method === 'DELETE') {
        // Check if fee exists
        const fee = await get('SELECT * FROM fees WHERE id = ?', [id]);
        
        if (!fee) {
          return res.status(404).json({ error: 'Fee not found' });
        }
        
        // Delete fee
        await run('DELETE FROM fees WHERE id = ?', [id]);
        
        res.status(200).json({ message: 'Fee deleted successfully' });
      }
      
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};