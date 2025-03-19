const logger = require('../config/logger');

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    
    logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
    res.status(401).json({
        success: false,
        message: 'Unauthorized access'
    });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }
    
    logger.warn(`Unauthorized admin access attempt from IP: ${req.ip}`);
    res.status(403).json({
        success: false,
        message: 'Access forbidden'
    });
};

module.exports = {
    isAuthenticated,
    isAdmin
}; 