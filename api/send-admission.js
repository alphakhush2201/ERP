import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    adminEmail: process.env.ADMIN_EMAIL || 'contactus.masteracademy@gmail.com',
    schoolName: process.env.SCHOOL_NAME || 'Master Academy'
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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
            address,
            prevSchool,
            reasonForLeaving,
            terms
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !dob || !gender || !grade || !parentName || 
            !relationship || !email || !phone || !address || !terms) {
            return res.status(400).json({ 
                success: false,
                error: 'All required fields must be filled' 
            });
        }

        let adminEmailSent = false;
        let parentEmailSent = false;

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
                <p><strong>Address:</strong> ${address}</p>

                <h3>Previous School Information:</h3>
                ${prevSchool ? `<p><strong>Previous School:</strong> ${prevSchool}</p>` : ''}
                ${reasonForLeaving ? `<p><strong>Reason for Leaving:</strong> ${reasonForLeaving}</p>` : ''}
            `
        });

        if (!adminEmailError) {
            adminEmailSent = true;
            console.log(`Admin notification sent for ${firstName} ${lastName}`);
        }

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
                console.log(`Confirmation email sent to ${email}`);
            }
        } catch (parentEmailError) {
            console.warn(`Could not send confirmation email to parent: ${parentEmailError.message}`);
        }

        // Return success if at least admin email was sent
        return res.status(200).json({ 
            message: 'Admission inquiry submitted successfully',
            success: true,
            details: {
                adminNotified: adminEmailSent,
                confirmationEmailSent: parentEmailSent,
                note: !parentEmailSent ? 'Confirmation email could not be sent. Our team will contact you shortly.' : undefined
            }
        });

    } catch (error) {
        console.error('Error processing admission inquiry:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to process admission inquiry. Please try again later.' 
        });
    }
} 