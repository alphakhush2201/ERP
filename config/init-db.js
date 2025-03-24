import sequelize from './database.js';
import '../models/associations.js';
import logger from './logger.js';

async function initializeDatabase() {
    try {
        // Test the connection
        await sequelize.authenticate();
        logger.info('Database connection established');

        // Drop all tables
        await sequelize.drop({ force: true });
        logger.info('All tables dropped');

        // Recreate all tables
        await sequelize.sync({ force: true });
        logger.info('All tables recreated');

        logger.info('Database initialization completed');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();