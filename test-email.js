import { Resend } from 'resend';

// Initialize with your API key
const resend = new Resend('re_7aEAANyx_9HmKx4z83MKmne3VtWnHY_');

try {
    const { data, error } = await resend.emails.send({
        from: 'Master Academy <onboarding@resend.dev>',
        to: ['khush1234nayak@gmail.com'],
        subject: 'Hello World',
        html: '<p>This is a test email sent at ' + new Date().toLocaleString() + '</p>'
    });

    if (error) {
        console.error('Error sending email:', error);
    } else {
        console.log('Success! Email sent:', data);
    }
} catch (error) {
    console.error('Error:', error);
} 