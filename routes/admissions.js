const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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

        try {
            // Send email to admin
            await resend.emails.send({
                from: 'Master Academy <onboarding@resend.dev>',
                to: process.env.ADMIN_EMAIL,
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
            });

            logger.info(`Admin notification sent for ${firstName} ${lastName}`);

            // Send confirmation email to parent
            await resend.emails.send({
                from: 'Master Academy <onboarding@resend.dev>',
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
            });

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

// Test endpoint for email
router.post('/test-email', async (req, res) => {
    try {
        // Log environment variables (safely)
        console.log('Environment check:', {
            hasApiKey: !!process.env.RESEND_API_KEY,
            apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3),
            adminEmail: process.env.ADMIN_EMAIL
        });

        // Validate environment variables
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        if (!process.env.ADMIN_EMAIL) {
            throw new Error('ADMIN_EMAIL is not configured');
        }

        // Create test email data
        const emailData = {
            from: 'Master Academy <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            subject: 'Test Email from Master Academy',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email sent at: ${new Date().toISOString()}</p>
                <p>If you receive this, the email configuration is working correctly!</p>
            `
        };

        console.log('Attempting to send email with data:', {
            ...emailData,
            to: emailData.to.substring(0, 10) + '...' // Truncate for privacy
        });

        // Send the email
        const result = await resend.emails.send(emailData);

        console.log('Email sent successfully:', result);

        // Return success response
        res.json({
            success: true,
            message: 'Test email sent successfully',
            emailId: result.id,
            sentTo: process.env.ADMIN_EMAIL
        });

    } catch (error) {
        // Log the full error
        console.error('Detailed error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            details: error.details || 'No additional details'
        });

        // Return error response
        res.status(500).json({
            success: false,
            error: 'Failed to send test email',
            message: error.message,
            details: {
                apiKeyConfigured: !!process.env.RESEND_API_KEY,
                adminEmailConfigured: !!process.env.ADMIN_EMAIL,
                errorType: error.name
            }
        });
    }
});

module.exports = router; 