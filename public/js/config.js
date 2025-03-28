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

// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://masteracademy.vercel.app/api';

export { API_URL }; 