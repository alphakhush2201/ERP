const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Create a new database connection
  const db = new sqlite3.Database(dbPath);
  
  // Promisify db.run and db.get
  const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) return reject(err);
        resolve(this);
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
    // Get admin teacher ID
    const admin = await get('SELECT id FROM teachers WHERE username = ?', ['admin']);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    // Add sample classes
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
    const grades = ['Grade 7A', 'Grade 8B', 'Grade 9C', 'Grade 10A', 'Grade 11B'];
    
    for (let i = 0; i < 10; i++) {
      const day = days[Math.floor(Math.random() * days.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const startHour = 8 + Math.floor(Math.random() * 8); // 8 AM to 3 PM
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
      
      await run(
        'INSERT INTO classes (name, grade, teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
        [subject, grade, admin.id, day, startTime, endTime]
      );
    }
    
    // Add sample assignments
    const assignmentTitles = [
      'Chapter Review', 'Research Paper', 'Group Project', 'Quiz Preparation', 'Lab Report'
    ];
    
    for (let i = 0; i < 5; i++) {
      const title = assignmentTitles[i];
      const description = `Complete the ${title.toLowerCase()} by the due date.`;
      const classId = i + 1; // Assuming we have at least 5 classes
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7 + i); // Due in 7-11 days
      
      await run(
        'INSERT INTO assignments (title, description, class_id, due_date, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [title, description, classId, dueDate.toISOString().split('T')[0]]
      );
    }
    
    // Add sample announcements
    const announcementTitles = [
      'Staff Meeting', 'Exam Schedule', 'School Event', 'Parent-Teacher Conference', 'Professional Development Day'
    ];
    
    const announcementContents = [
      'Staff meeting scheduled for Friday at 3:30 PM in the conference room.',
      'Final exam schedule has been published. Please review and confirm your invigilation duties.',
      'Annual school day celebration will be held next month. Please prepare your students for performances.',
      'Parent-teacher conferences will be held next week. Please prepare student progress reports.',
      'Professional development workshop on new teaching methodologies will be conducted this weekend.'
    ];
    
    for (let i = 0; i < 5; i++) {
      await run(
        'INSERT INTO announcements (title, content, created_by, created_at) VALUES (?, ?, ?, datetime("now", "-" || ? || " days"))',
        [announcementTitles[i], announcementContents[i], admin.id, i]
      );
    }
    
    // Add sample students
    const firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Alexander', 'Isabella'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    
    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const studentId = `ST${new Date().getFullYear()}${(i + 1).toString().padStart(3, '0')}`;
      const dob = new Date(2005 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const grade = `Grade ${7 + Math.floor(Math.random() * 5)}`;
      const section = String.fromCharCode(65 + Math.floor(Math.random() * 3)); // A, B, or C
      
      await run(
        `INSERT INTO students (
          student_id, first_name, last_name, date_of_birth, gender, grade, section, 
          admission_date, previous_school, parent_name, parent_relationship, 
          parent_email, parent_phone, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, date('now', '-' || ? || ' months'), ?, ?, ?, ?, ?, ?)`,
        [
          studentId, firstName, lastName, dob.toISOString().split('T')[0], gender, grade, section,
          Math.floor(Math.random() * 24), // 0-24 months ago
          'Previous School ' + Math.floor(Math.random() * 5),
          `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
          Math.random() > 0.5 ? 'father' : 'mother',
          `parent.${lastName.toLowerCase()}@example.com`,
          `555-${Math.floor(1000 + Math.random() * 9000)}`,
          `${Math.floor(100 + Math.random() * 900)} Main St, City`
        ]
      );
    }
    
    res.status(200).json({ message: 'Sample data added successfully' });
  } catch (error) {
    console.error('Error adding sample data:', error);
    res.status(500).json({ error: 'Failed to add sample data' });
  } finally {
    // Close the database connection
    db.close();
  }
};