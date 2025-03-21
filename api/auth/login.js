export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple response for now
    res.status(200).json({ 
        success: true,
        message: 'Login functionality coming soon'
    });
} 