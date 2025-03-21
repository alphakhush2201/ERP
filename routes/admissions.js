const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Create a transporter using nodemailer with OAuth2
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: process.env.GMAIL_ACCESS_TOKEN
    }
});

// Test email configuration
transporter.verify(function(error, success) {
    if (error) {
        logger.error('Email configuration error:', error);
    } else {
        logger.info('Email server is ready to send messages');
    }
});

// Validation middleware
const validateAdmissionForm = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('dob').notEmpty().withMessage('Date of birth is required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('grade').notEmpty().withMessage('Grade is required'),
    body('parentName').trim().notEmpty().withMessage('Parent/Guardian name is required'),
    body('relationship').notEmpty().withMessage('Relationship is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('terms').equals('true').withMessage('You must accept the terms and conditions')
];

// Handle admission form submission
router.post('/send-admission', validateAdmissionForm, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            firstName,
            lastName,
            dob,
            gender,
            grade,
            parentName,
            relationship,
            email,
            phone,
            altPhone,
            address,
            prevSchool,
            reasonForLeaving
        } = req.body;

        // Create email content
        const mailOptions = {
            from: `"Master Academy" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: 'New Admission Inquiry',
            html: `
                <h2>New Admission Inquiry</h2>
                <h3>Student Information:</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Date of Birth:</strong> ${dob}</p>
                <p><strong>Gender:</strong> ${gender}</p>
                <p><strong>Applying for Grade:</strong> ${grade}</p>

                <h3>Parent/Guardian Information:</h3>
                <p><strong>Name:</strong> ${parentName}</p>
                <p><strong>Relationship:</strong> ${relationship}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                ${altPhone ? `<p><strong>Alternative Phone:</strong> ${altPhone}</p>` : ''}
                <p><strong>Address:</strong> ${address}</p>

                <h3>Previous School Information:</h3>
                ${prevSchool ? `<p><strong>Previous School:</strong> ${prevSchool}</p>` : ''}
                ${reasonForLeaving ? `<p><strong>Reason for Leaving:</strong> ${reasonForLeaving}</p>` : ''}
            `
        };

        try {
            // Send email to admin
            await transporter.sendMail(mailOptions);
            logger.info(`Admin notification sent for ${firstName} ${lastName}`);

            // Send confirmation email to parent
            const parentMailOptions = {
                from: `"Master Academy" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Admission Inquiry Confirmation - Master Academy',
                html: `
                    <h2>Thank you for your interest in Master Academy</h2>
                    <p>Dear ${parentName},</p>
                    <p>We have received your admission inquiry for ${firstName} ${lastName}. Our admissions team will review your application and contact you shortly.</p>
                    <p>Here are the details you submitted:</p>
                    <ul>
                        <li>Student Name: ${firstName} ${lastName}</li>
                        <li>Grade Applied For: ${grade}</li>
                        <li>Contact Email: ${email}</li>
                        <li>Contact Phone: ${phone}</li>
                    </ul>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Best regards,<br>Master Academy Admissions Team</p>
                `
            };

            await transporter.sendMail(parentMailOptions);
            logger.info(`Confirmation email sent to ${email}`);

            res.json({ message: 'Admission inquiry submitted successfully' });
        } catch (emailError) {
            logger.error('Error sending emails:', emailError);
            throw new Error('Failed to send emails');
        }
    } catch (error) {
        logger.error('Error processing admission inquiry:', error);
        res.status(500).json({ error: 'Failed to process admission inquiry. Please try again later.' });
    }
});

module.exports = router; 