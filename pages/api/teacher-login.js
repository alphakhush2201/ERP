const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create a new database connection
  const db = new sqlite3.Database(dbPath);
  
  // Promisify db.get and db.run
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
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    
    // Query the database for the user
    const user = await get(
      'SELECT id, username, password, first_name, last_name FROM teachers WHERE username = ?',
      [username]
    );
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Update last login time
    await run(
      'UPDATE teachers SET last_login = datetime("now") WHERE id = ?',
      [user.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return success response with token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    // Close the database connection
    db.close();
  }
};