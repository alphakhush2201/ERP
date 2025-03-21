const express = require('express');
const router = express.Router();

// Basic student routes for now
router.get('/', (req, res) => {
    res.json({ message: 'Students API endpoint' });
});

module.exports = router; 