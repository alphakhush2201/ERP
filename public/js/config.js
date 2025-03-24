// Environment Configuration
const ENV = {
    development: {
        API_URL: 'http://localhost:3000/api'
    },
    production: {
        // Use the deployed API URL
        API_URL: 'https://masteracademt.vercel.app/api'
    }
};

// Determine current environment
const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';

const currentEnv = isDevelopment ? 'development' : 'production';

// Export configuration
const config = ENV[currentEnv];

// Add version for cache busting
config.version = '1.0.0';

// Add deployment info
config.deployedOn = 'vercel';
config.lastDeployed = new Date().toISOString();

// Determine if we're in production by checking the hostname
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Set the API URL based on the environment
export const API_URL = isProduction
    ? 'https://masteracademt.vercel.app/api'  // Production API URL
    : 'http://localhost:3000/api';            // Development API URL 