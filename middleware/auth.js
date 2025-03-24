import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn(`No token provided from IP: ${req.ip}`);
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.warn(`Invalid token from IP: ${req.ip}`);
        return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }
    
    logger.warn(`Unauthorized admin access attempt from IP: ${req.ip}`);
    res.status(403).json({
        success: false,
        message: 'Access forbidden - Admin only'
    });
}; 