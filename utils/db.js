import pg from 'pg';
import logger from '../config/logger.js';
import 'dotenv/config';

// Create a PostgreSQL pool for connection reuse
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
pool.connect()
  .then(client => {
    logger.info('Database connection has been established successfully.');
    client.release();
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
  });

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
export async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Function that receives a client and executes queries
 * @returns {Promise} - Transaction result
 */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all database connections
 */
export async function closePool() {
  await pool.end();
  logger.info('All database connections closed');
}

export default {
  query,
  transaction,
  closePool
};