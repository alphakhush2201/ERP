const { validationResult } = require('express-validator');
const logger = require('../config/logger');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation error:', errors.array());
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

module.exports = validate; 