document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = 'teacher-login.html';
        return;
    }
    
    // Parse the JWT token
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Update teacher name
        document.getElementById('teacherName').textContent = payload.name;
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            // Token expired, redirect to login
            localStorage.removeItem('teacherToken');
            sessionStorage.removeItem('teacherToken');
            window.location.href = 'teacher-login.html';
            return;
        }
    } catch (error) {
        console.error('Error parsing token:', error);
        window.location.href = 'teacher-login.html';
        return;
    }
    
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('teacherToken');
        sessionStorage.removeItem('teacherToken');
        window.location.href = 'teacher-login.html';
    });
    
    // Fetch students data
    fetchStudents();
    
    // Add event listeners for search and filter
    document.getElementById('searchInput').addEventListener('input', function() {
        fetchStudents();
    });
    
    document.getElementById('gradeFilter').addEventListener('change', function() {
        fetchStudents();
    });
});

// Variables for pagination
let currentPage = 1;
const studentsPerPage = 10;
let totalStudents = 0;

// Function to fetch students data
function fetchStudents() {
    const searchTerm = document.getElementById('searchInput').value;
    const gradeFilter = document.getElementById('gradeFilter').value;
    
    fetch(`/api/students?page=${currentPage}&limit=${studentsPerPage}&search=${searchTerm}&grade=${gradeFilter}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch students data');
        }
        return response.json();
    })
    .then(data => {
        displayStudents(data.students);
        totalStudents = data.total;
        setupPagination();
    })
    .catch(error => {
        console.error('Error fetching students data:', error);
    });
}

// Function to display students
function displayStudents(students) {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center;">No students found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.grade}</td>
            <td>${student.section}</td>
            <td>${student.parent_name}</td>
            <td>${student.parent_phone}</td>
            <td>
                <button class="action-btn" onclick="viewStudent(${student.id})">View</button>
                <button class="action-btn" onclick="editStudent(${student.id})">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to set up pagination
function setupPagination() {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';
    
    const totalPages = Math.ceil(totalStudents / studentsPerPage);
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchStudents();
        }
    });
    paginationElement.appendChild(prevButton);
    
    // Page buttons
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchStudents();
        });
        paginationElement.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchStudents();
        }
    });
    paginationElement.appendChild(nextButton);
}

// Add these functions to handle view and edit actions

// Function to view student details
function viewStudent(id) {
    fetch(`/api/students/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }
        return response.json();
    })
    .then(student => {
        // Populate the view modal with student data
        document.getElementById('viewStudentId').textContent = student.student_id;
        document.getElementById('viewFullName').textContent = `${student.first_name} ${student.last_name}`;
        document.getElementById('viewGradeSection').textContent = `${student.grade} - ${student.section}`;
        document.getElementById('viewDob').textContent = formatDate(student.date_of_birth);
        document.getElementById('viewGender').textContent = capitalizeFirstLetter(student.gender);
        document.getElementById('viewAdmissionDate').textContent = formatDate(student.admission_date);
        document.getElementById('viewPreviousSchool').textContent = student.previous_school || 'N/A';
        document.getElementById('viewParentName').textContent = student.parent_name;
        document.getElementById('viewParentRelationship').textContent = capitalizeFirstLetter(student.parent_relationship);
        document.getElementById('viewParentEmail').textContent = student.parent_email;
        document.getElementById('viewParentPhone').textContent = student.parent_phone;
        document.getElementById('viewAddress').textContent = student.address;
        
        // Show the view modal
        document.getElementById('viewStudentModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching student details:', error);
        alert('Failed to load student details');
    });
}

// Add these functions to handle the edit functionality

// Function to edit student
function editStudent(id) {
    fetch(`/api/students/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }
        return response.json();
    })
    .then(student => {
        // Store student ID for update
        document.getElementById('editStudentForm').dataset.studentId = student.id;
        
        // Populate the edit form with student data
        document.getElementById('editFirstName').value = student.first_name;
        document.getElementById('editLastName').value = student.last_name;
        document.getElementById('editDateOfBirth').value = student.date_of_birth;
        document.getElementById('editGender').value = student.gender;
        document.getElementById('editGrade').value = student.grade;
        document.getElementById('editSection').value = student.section;
        document.getElementById('editPreviousSchool').value = student.previous_school || '';
        document.getElementById('editAdmissionDate').value = student.admission_date;
        document.getElementById('editParentName').value = student.parent_name;
        document.getElementById('editParentRelationship').value = student.parent_relationship;
        document.getElementById('editParentEmail').value = student.parent_email;
        document.getElementById('editParentPhone').value = student.parent_phone;
        document.getElementById('editAddress').value = student.address;
        
        // Show the edit modal
        document.getElementById('editStudentModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching student details for edit:', error);
        alert('Failed to load student details for editing');
    });
}

// Handle edit form submission
document.addEventListener('DOMContentLoaded', function() {
    const editStudentForm = document.getElementById('editStudentForm');
    editStudentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const studentId = this.dataset.studentId;
        
        // Collect form data
        const formData = {
            first_name: document.getElementById('editFirstName').value,
            last_name: document.getElementById('editLastName').value,
            date_of_birth: document.getElementById('editDateOfBirth').value,
            gender: document.getElementById('editGender').value,
            grade: document.getElementById('editGrade').value,
            section: document.getElementById('editSection').value,
            previous_school: document.getElementById('editPreviousSchool').value || null,
            admission_date: document.getElementById('editAdmissionDate').value,
            parent_name: document.getElementById('editParentName').value,
            parent_relationship: document.getElementById('editParentRelationship').value,
            parent_email: document.getElementById('editParentEmail').value,
            parent_phone: document.getElementById('editParentPhone').value,
            address: document.getElementById('editAddress').value
        };
        
        // Submit data to API
        fetch(`/api/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken')}`
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update student');
            }
            return response.json();
        })
        .then(data => {
            alert('Student updated successfully');
            closeEditModal();
            fetchStudents(); // Refresh the student list
        })
        .catch(error => {
            console.error('Error updating student:', error);
            alert('Failed to update student. Please try again.');
        });
    });
    
    // Edit modal close function
    function closeEditModal() {
        document.getElementById('editStudentModal').style.display = 'none';
        document.getElementById('editStudentForm').reset();
    }
    
    // Edit modal close button
    document.querySelector('#editStudentModal .close').addEventListener('click', closeEditModal);
    document.querySelector('#editStudentModal .cancel-btn').addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('editStudentModal')) {
            closeEditModal();
        }
    });
});

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeFirstLetter(string) {
    if (!string) return 'N/A';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Modal close functions
function closeViewModal() {
    document.getElementById('viewStudentModal').style.display = 'none';
}

function closeEditModal() {
    document.getElementById('editStudentModal').style.display = 'none';
    document.getElementById('editStudentForm').reset();
}

// Add event listeners for modal close buttons
document.addEventListener('DOMContentLoaded', function() {
    // Existing code...
    
    // View modal close button
    document.querySelector('#viewStudentModal .close').addEventListener('click', closeViewModal);
    document.querySelector('#viewStudentModal .cancel-btn').addEventListener('click', closeViewModal);
    
    // Edit modal close button
    document.querySelector('#editStudentModal .close').addEventListener('click', closeEditModal);
    document.querySelector('#editStudentModal .cancel-btn').addEventListener('click', closeEditModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('viewStudentModal')) {
            closeViewModal();
        }
        if (event.target === document.getElementById('editStudentModal')) {
            closeEditModal();
        }
    });
});

// Modal functionality
const modal = document.getElementById('addStudentModal');
const addStudentBtn = document.querySelector('.add-student-btn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.querySelector('.cancel-btn');
const addStudentForm = document.getElementById('addStudentForm');

// Set today's date as default for admission date
document.getElementById('admissionDate').valueAsDate = new Date();

// Open modal
addStudentBtn.addEventListener('click', function() {
    modal.style.display = 'block';
});

// Close modal
function closeModal() {
    modal.style.display = 'none';
    addStudentForm.reset();
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Handle form submission
addStudentForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Generate a student ID (e.g., ST2023001)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const studentId = `ST${year}${randomNum}`;
    
    // Collect form data
    const formData = {
        student_id: studentId,
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        date_of_birth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        grade: document.getElementById('grade').value,
        section: document.getElementById('section').value,
        admission_date: document.getElementById('admissionDate').value,
        previous_school: document.getElementById('previousSchool').value || null,
        parent_name: document.getElementById('parentName').value,
        parent_relationship: document.getElementById('parentRelationship').value,
        parent_email: document.getElementById('parentEmail').value,
        parent_phone: document.getElementById('parentPhone').value,
        address: document.getElementById('address').value
    };
    
    // Submit data to API
    fetch('/api/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken')}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add student');
        }
        return response.json();
    })
    .then(data => {
        alert(`Student added successfully with ID: ${data.student_id}`);
        closeModal();
        fetchStudents(); // Refresh the student list
    })
    .catch(error => {
        console.error('Error adding student:', error);
        alert('Failed to add student. Please try again.');
    });
});

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');

// Database path
const dbPath = path.resolve(process.cwd(), 'database.sqlite');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET all students
router.get('/', verifyToken, (req, res) => {
  console.log('GET /api/students called');
  
  const db = new sqlite3.Database(dbPath);
  
  db.all(`
    SELECT id, student_id, first_name, last_name, grade
    FROM students
    ORDER BY grade, last_name, first_name
  `, [], (err, students) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log(`Found ${students.length} students`);
    
    res.json({ students });
    
    db.close();
  });
});

module.exports = router;