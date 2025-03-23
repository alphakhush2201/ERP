# Skool ERP System

A comprehensive school management system built with Express.js and React.

## Features

- Role-based authentication (Admin, Principal, Teachers)
- Student management
- Class management
- Attendance tracking
- Grade management
- Parent communication
- Reports generation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Next.js, Tailwind CSS
- **Database**: MySQL
- **Authentication**: JWT
- **Deployment**: Vercel

## Prerequisites

- Node.js >= 18.0.0
- MySQL
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skool-erp.git
   cd skool-erp
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

## Development

1. Start the development server:
   ```bash
   # Start backend
   npm run dev

   # In a separate terminal, start frontend
   cd frontend
   npm run dev
   ```

2. Visit `http://localhost:3000` in your browser

## Deployment

The project is configured for deployment on Vercel:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set up environment variables in Vercel dashboard

## Environment Variables

Required environment variables:

```
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=skool_erp

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

## Project Structure

```
skool-erp/
├── frontend/          # React frontend
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── models/          # Database models
├── routes/          # Express routes
├── utils/           # Utility functions
├── public/          # Static files
├── server.js        # Express app
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 