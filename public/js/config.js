// Environment Configuration
const ENV = {
    development: {
        API_URL: 'http://localhost:3000/api'
    },
    production: {
        // In production (Vercel), use relative path and let the routing handle it
        API_URL: '/api'
    }
};

// Determine current environment
const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('gitpod.io') ||
    window.location.hostname.includes('stackblitz.io');

const currentEnv = isDevelopment ? 'development' : 'production';

// Export configuration
const config = ENV[currentEnv];

// Add version for cache busting
config.version = '1.0.0';

// Add deployment info
config.deployedOn = 'vercel';
config.lastDeployed = new Date().toISOString(); 