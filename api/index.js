export default function handler(req, res) {
    // Redirect to the main page or send a welcome message
    res.status(200).json({
        status: 'online',
        message: 'Welcome to Master Academy API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            admissions: '/api/send-admission',
            auth: '/api/auth/login'
        }
    });
} 