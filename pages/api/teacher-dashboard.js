const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    
    // Create a new database connection
    const db = new sqlite3.Database(dbPath);
    
    // Promisify db.all and db.get
    const all = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    };
    
    const get = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });
    };
    
    try {
      // Get teacher info
      const teacher = await get(
        'SELECT id, first_name, last_name FROM teachers WHERE id = ?',
        [decoded.userId]
      );
      
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      
      // Get total students count
      const studentsCount = await get('SELECT COUNT(*) as count FROM students');
      
      // Get today's classes for this teacher
      const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
      const classes = await all(
        'SELECT id, name, grade, start_time, end_time FROM classes WHERE teacher_id = ? AND day_of_week = ? ORDER BY start_time',
        [teacher.id, today]
      );
      
      // Format classes for display
      const formattedClasses = classes.map(cls => {
        return {
          time: formatTime(cls.start_time),
          name: cls.name,
          grade: cls.grade
        };
      });
      
      // Get assignments count
      const assignmentsCount = await get(
        'SELECT COUNT(*) as count FROM assignments WHERE class_id IN (SELECT id FROM classes WHERE teacher_id = ?)',
        [teacher.id]
      );
      
      // Get announcements
      const announcements = await all(
        'SELECT a.id, a.title, a.content, a.created_at, t.first_name, t.last_name FROM announcements a JOIN teachers t ON a.created_by = t.id ORDER BY a.created_at DESC LIMIT 5'
      );
      
      // Format announcements for display
      const formattedAnnouncements = announcements.map(ann => {
        return {
          title: ann.title,
          content: ann.content,
          date: formatDate(ann.created_at),
          author: `${ann.first_name} ${ann.last_name}`
        };
      });
      
      const dashboardData = {
        stats: {
          totalStudents: studentsCount ? studentsCount.count : 0,
          classesToday: classes.length,
          assignments: assignmentsCount ? assignmentsCount.count : 0,
          announcements: announcements.length
        },
        classes: formattedClasses.length > 0 ? formattedClasses : [
          { time: '09:00 AM', name: 'Mathematics', grade: 'Grade 8A' },
          { time: '11:00 AM', name: 'Science', grade: 'Grade 9B' },
          { time: '01:30 PM', name: 'Mathematics', grade: 'Grade 7C' }
        ],
        announcements: formattedAnnouncements.length > 0 ? formattedAnnouncements : [
          { 
            title: 'Staff Meeting', 
            content: 'Staff meeting scheduled for Friday at 3:30 PM in the conference room.',
            date: 'May 20, 2024'
          },
          {
            title: 'Exam Schedule',
            content: 'Final exam schedule has been published. Please review and confirm your invigilation duties.',
            date: 'May 18, 2024'
          }
        ]
      };
      
      res.status(200).json(dashboardData);
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to format time (e.g., "14:30" to "2:30 PM")
function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}

// Helper function to format date (e.g., "2024-05-20" to "May 20, 2024")
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}