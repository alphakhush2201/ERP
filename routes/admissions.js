import express from 'express';
import { body, validationResult } from 'express-validator';
import { Resend } from 'resend';
import logger from '../config/logger.js';

const router = express.Router();

// Initialize Resend for email sending with a fallback for missing API key
const resendApiKey = process.env.RESEND_API_KEY || 'dummy_key_for_development';
const resend = new Resend(resendApiKey);

// Log warning if using dummy key
if (!process.env.RESEND_API_KEY) {
  logger.warn('RESEND_API_KEY not found in environment variables. Email functionality will not work.');
}

// Email configuration
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    adminEmail: process.env.ADMIN_EMAIL || 'contactus.masteracademy@gmail.com',
    schoolName: process.env.SCHOOL_NAME || 'Master Academy'
};

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

// Test endpoint for email
router.post('/test-email', async (req, res) => {
    try {
        console.log('Environment check:', {
            hasApiKey: !!process.env.RESEND_API_KEY,
            apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3)
        });

        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['contactus.masteracademy@gmail.com'],
            subject: 'Test Email - ' + new Date().toLocaleTimeString(),
            html: `
                <h1>Test Email</h1>
                <p>This is a test email sent at: ${new Date().toLocaleString()}</p>
                <p>If you receive this, the email configuration is working correctly!</p>
            `
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        console.log('Email sent successfully:', data);
        res.json({
            success: true,
            message: 'Test email sent successfully',
            data
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send test email',
            message: error.message
        });
    }
});

// Handle admission form submission
router.post('/send-admission', validateAdmissionForm, async (req, res) => {
    try {
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

        let adminEmailSent = false;
        let parentEmailSent = false;

        try {
            // Send email to admin
            const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
                from: EMAIL_CONFIG.from,
                to: [EMAIL_CONFIG.adminEmail],
                subject: `New Admission Inquiry - ${firstName} ${lastName}`,
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

            if (adminEmailError) {
                throw adminEmailError;
            }

            adminEmailSent = true;
            logger.info(`Admin notification sent for ${firstName} ${lastName}`);

            // Try to send confirmation email to parent
            try {
                const { data: parentEmailData, error: parentEmailError } = await resend.emails.send({
                    from: EMAIL_CONFIG.from,
                    to: [email],
                    subject: `Admission Inquiry Confirmation - ${EMAIL_CONFIG.schoolName}`,
                    html: `
                        <h2>Thank you for your interest in ${EMAIL_CONFIG.schoolName}</h2>
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
                        <p>Best regards,<br>${EMAIL_CONFIG.schoolName} Admissions Team</p>
                    `
                });

                if (!parentEmailError) {
                    parentEmailSent = true;
                    logger.info(`Confirmation email sent to ${email}`);
                }
            } catch (parentEmailError) {
                logger.warn(`Could not send confirmation email to parent: ${parentEmailError.message}`);
            }

            // Return success if at least admin email was sent
            res.json({ 
                message: 'Admission inquiry submitted successfully',
                success: true,
                details: {
                    adminNotified: adminEmailSent,
                    confirmationEmailSent: parentEmailSent,
                    note: !parentEmailSent ? 'Confirmation email could not be sent. Our team will contact you shortly.' : undefined
                }
            });

        } catch (emailError) {
            logger.error('Error sending emails:', emailError);
            throw new Error('Failed to process admission inquiry');
        }
    } catch (error) {
        logger.error('Error processing admission inquiry:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to process admission inquiry. Please try again later.' 
        });
    }
});

export default router;