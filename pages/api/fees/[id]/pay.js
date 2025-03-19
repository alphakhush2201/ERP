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
      // Handle PUT request - mark fee as paid
      if (req.method === 'PUT') {
        // Check if fee exists
        const fee = await get('SELECT * FROM fees WHERE id = ?', [id]);
        
        if (!fee) {
          return res.status(404).json({ error: 'Fee not found' });
        }
        
        // Update fee to mark as paid
        await run(
          `UPDATE fees SET
           payment_date = ?,
           payment_method = ?,
           status = 'paid',
           updated_at = datetime('now')
           WHERE id = ?`,
          [
            req.body.paymentDate,
            req.body.paymentMethod,
            id
          ]
        );
        
        res.status(200).json({ message: 'Fee marked as paid successfully' });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
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