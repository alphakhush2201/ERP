const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.sqlite');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const db = new sqlite3.Database(dbPath);
    
    db.get('SELECT * FROM teachers WHERE username = ?', [username], async (err, teacher) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!teacher) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, teacher.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { 
                id: teacher.id,
                name: teacher.name,
                username: teacher.username
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({ token });
    });
    
    db.close();
});

module.exports = router;