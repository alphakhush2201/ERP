import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
    res.status(200).json({ message: 'Login functionality coming soon' });
});

export default router;