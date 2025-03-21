# School Management System

A comprehensive school management system built with Node.js and Express, featuring admission management, email notifications, and more.

## Features

- Admission form submission
- Automated email notifications
- Secure session management
- Database storage
- Input validation
- Rate limiting
- Security best practices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=production
   PORT=3000
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=your_verified_email
   ADMIN_EMAIL=your_admin_email
   SCHOOL_NAME=Your School Name
   SESSION_SECRET=your_secure_session_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Deployment

1. Set up your production environment
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start the server: `npm start`

## Email Configuration

1. Sign up for a Resend account at https://resend.com
2. Verify your domain
3. Update the EMAIL_FROM in .env with your verified domain email
4. Configure ADMIN_EMAIL for receiving notifications

## Security Notes

- Always use HTTPS in production
- Keep your SESSION_SECRET secure and unique
- Regularly update dependencies
- Monitor server logs for unusual activity

## License

This project is licensed under the MIT License - see the LICENSE file for details. 