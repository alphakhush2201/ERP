const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify transporter configuration
    await transporter.verify();
    
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Master Academy',
      html: `<h2>Test Email</h2><p>Time sent: ${new Date().toLocaleString()}</p>`
    };

    await transporter.sendMail(testMailOptions);
    res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Email Service Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message
    });
  }
}