const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.sqlite');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded admin credentials for testing
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign(
            { id: 1, username: 'admin', role: 'admin' },
            process.env.SESSION_SECRET || 'your-fallback-secret',
            { expiresIn: '24h' }
        );
        
        // Set cookie for additional security
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        return res.json({
            success: true,
            token,
            user: { 
                id: 1,
                username: 'admin', 
                role: 'admin',
                name: 'Administrator'
            }
        });
    }
    
    // If not admin credentials, return error
    return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
    });
});

module.exports = router;