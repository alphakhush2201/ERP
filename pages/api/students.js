import jwt from 'jsonwebtoken';
import { query } from '../../utils/db.js';
import 'dotenv/config';

export default async function handler(req, res) {
  console.log('Students API called with method:', req.method);
  
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Use PostgreSQL connection
    
    try {
      // Handle GET request - fetch students
      if (req.method === 'GET') {
        console.log('Fetching students from database');
        
        // Check if students table exists
        const tableExists = await query(
          `SELECT to_regclass('public.students') as table_exists`
        );
        
        if (!tableExists.rows[0].table_exists) {
          console.error('Students table does not exist');
          return res.status(500).json({ error: 'Students table does not exist' });
        }
        
        const studentsResult = await query(`
          SELECT id, student_id, first_name, last_name, grade
          FROM students
          ORDER BY grade, last_name, first_name
        `);
        
        const students = studentsResult.rows;
        
        console.log(`Found ${students.length} students`);
        
        res.status(200).json({
          students
        });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
      
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};