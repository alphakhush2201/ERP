const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Add environment variable check
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('Missing required environment variables');
}

// Change from export default to module.exports
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Add basic validation
    if (!data || !data.firstName || !data.lastName || !data.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contactus.masteracademy@gmail.com',
      subject: 'New Admission Inquiry',
      html: `
        <h2>Student Information</h2>
        <p>Name: ${data.firstName} ${data.lastName}</p>
        <p>Date of Birth: ${data.dob}</p>
        <p>Gender: ${data.gender}</p>
        <p>Grade: ${data.grade}</p>
        
        <h2>Parent Information</h2>
        <p>Name: ${data.parentName}</p>
        <p>Relationship: ${data.relationship}</p>
        <p>Email: ${data.email}</p>
        <p>Phone: ${data.phone}</p>
        <p>Alternative Phone: ${data.altPhone || 'Not provided'}</p>
        <p>Address: ${data.address}</p>

        <h2>Previous School Information</h2>
        <p>School Name: ${data.prevSchool || 'Not provided'}</p>
        <p>Reason for Leaving: ${data.reasonForLeaving || 'Not provided'}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}