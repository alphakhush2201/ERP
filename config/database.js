import { Sequelize } from 'sequelize';
import logger from './logger.js';
import 'dotenv/config';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    schema: 'public',
    logging: (msg) => logger.debug(msg)
});

// Test the connection
sequelize.authenticate()
    .then(() => {
        logger.info('Database connection has been established successfully.');
    })
    .catch(err => {
        logger.error('Unable to connect to the database:', err);
    });

export default sequelize; 