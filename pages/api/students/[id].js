import jwt from 'jsonwebtoken';
import { query } from '../../../utils/db.js';
import 'dotenv/config';

export default async function handler(req, res) {
  // Get student ID from the URL
  const studentId = req.query.id;
  
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Use PostgreSQL connection
    
    try {
      // Handle GET request - fetch student details
      if (req.method === 'GET') {
        const studentResult = await query('SELECT * FROM students WHERE id = $1', [studentId]);
        const student = studentResult.rows[0];
        
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        res.status(200).json(student);
      }
      // Handle PUT request - update student
      else if (req.method === 'PUT') {
        // Check if student exists
        const studentResult = await query('SELECT * FROM students WHERE id = $1', [studentId]);
        const student = studentResult.rows[0];
        
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        
        // Validate required fields
        const requiredFields = [
          'first_name', 'last_name', 'date_of_birth', 
          'gender', 'grade', 'section', 'admission_date', 
          'parent_name', 'parent_relationship', 'parent_email', 
          'parent_phone', 'address'
        ];
        
        for (const field of requiredFields) {
          if (!req.body[field]) {
            return res.status(400).json({ error: `${field} is required` });
          }
        }
        
        // Update student
        await query(
          `UPDATE students SET 
            first_name = $1, 
            last_name = $2, 
            date_of_birth = $3, 
            gender = $4, 
            grade = $5, 
            section = $6, 
            admission_date = $7, 
            previous_school = $8, 
            parent_name = $9, 
            parent_relationship = $10, 
            parent_email = $11, 
            parent_phone = $12, 
            address = $13
          WHERE id = $14`,
          [
            req.body.first_name,
            req.body.last_name,
            req.body.date_of_birth,
            req.body.gender,
            req.body.grade,
            req.body.section,
            req.body.admission_date,
            req.body.previous_school,
            req.body.parent_name,
            req.body.parent_relationship,
            req.body.parent_email,
            req.body.parent_phone,
            req.body.address,
            studentId
          ]
        );
        
        res.status(200).json({ 
          message: 'Student updated successfully',
          id: studentId
        });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    }
  } catch (error) {
    console.error('Student API error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};