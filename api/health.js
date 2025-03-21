export default function handler(req, res) {
    res.status(200).json({
        status: 'healthy',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
} 