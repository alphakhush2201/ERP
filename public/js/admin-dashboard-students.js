document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = '../auth/admin-login.html';
        return;
    }
    
    // Parse the JWT token
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Update admin name
        document.getElementById('teacherName').textContent = payload.name || 'Admin';
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            // Token expired, redirect to login
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminToken');
            window.location.href = '../auth/admin-login.html';
            return;
        }
    } catch (error) {
        console.error('Error parsing token:', error);
        window.location.href = '../auth/admin-login.html';
        return;
    }
    
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        window.location.href = '../auth/admin-login.html';
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

    // Add event listener for add student button
    document.querySelector('.add-student-btn').addEventListener('click', function() {
        document.getElementById('addStudentModal').style.display = 'block';
    });

    // Add event listener for add student form submission
    document.getElementById('addStudentForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addStudent();
    });

    // Add event listeners for modal close buttons
    setupModalCloseListeners();
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
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch students data');
        }
        return response.json();
    })
    .then(data => {
        displayStudents(data.data || data.students);
        totalStudents = data.total || (data.data ? data.data.length : 0);
        setupPagination();
    })
    .catch(error => {
        console.error('Error fetching students data:', error);
        alert('Failed to load students data. Please try again.');
    });
}

// Function to display students
function displayStudents(students) {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = '';
    
    if (!students || students.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align: center;">No students found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id.substring(0, 8)}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.grade}</td>
            <td>${student.section || 'N/A'}</td>
            <td>${student.parentName}</td>
            <td>${student.parentPhone}</td>
            <td>
                <button class="action-btn view-btn" data-id="${student.id}">View</button>
                <button class="action-btn edit-btn" data-id="${student.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${student.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            viewStudent(studentId);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            editStudent(studentId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this student?')) {
                deleteStudent(studentId);
            }
        });
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
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchStudents();
        }
    });
    paginationElement.appendChild(nextButton);
}

// Function to add a new student
function addStudent() {
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        grade: document.getElementById('grade').value,
        section: document.getElementById('section').value,
        previousSchool: document.getElementById('previousSchool').value || null,
        enrollmentDate: document.getElementById('admissionDate').value,
        parentName: document.getElementById('parentName').value,
        parentRelationship: document.getElementById('parentRelationship').value,
        parentEmail: document.getElementById('parentEmail').value,
        parentPhone: document.getElementById('parentPhone').value,
        street: document.getElementById('address').value,
        status: 'active'
    };
    
    fetch('/api/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
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
        alert('Student added successfully');
        document.getElementById('addStudentModal').style.display = 'none';
        document.getElementById('addStudentForm').reset();
        fetchStudents(); // Refresh the student list
    })
    .catch(error => {
        console.error('Error adding student:', error);
        alert('Failed to add student. Please try again.');
    });
}

// Function to view student details
function viewStudent(id) {
    fetch(`/api/students/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }
        return response.json();
    })
    .then(data => {
        const student = data.data;
        // Populate the view modal with student data
        document.getElementById('viewStudentId').textContent = student.id.substring(0, 8);
        document.getElementById('viewFullName').textContent = `${student.firstName} ${student.lastName}`;
        document.getElementById('viewGradeSection').textContent = `${student.grade} ${student.section ? '- ' + student.section : ''}`;
        document.getElementById('viewDob').textContent = formatDate(student.dateOfBirth);
        document.getElementById('viewGender').textContent = capitalizeFirstLetter(student.gender);
        document.getElementById('viewAdmissionDate').textContent = formatDate(student.enrollmentDate);
        document.getElementById('viewPreviousSchool').textContent = student.previousSchool || 'N/A';
        document.getElementById('viewParentName').textContent = student.parentName;
        document.getElementById('viewParentRelationship').textContent = capitalizeFirstLetter(student.parentRelationship || 'N/A');
        document.getElementById('viewParentEmail').textContent = student.parentEmail;
        document.getElementById('viewParentPhone').textContent = student.parentPhone;
        document.getElementById('viewAddress').textContent = student.street || 'N/A';
        
        // Show the view modal
        document.getElementById('viewStudentModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching student details:', error);
        alert('Failed to load student details');
    });
}

// Function to edit student
function editStudent(id) {
    fetch(`/api/students/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }
        return response.json();
    })
    .then(data => {
        const student = data.data;
        // Store student ID for update
        document.getElementById('editStudentForm').dataset.studentId = student.id;
        
        // Populate the edit form with student data
        document.getElementById('editFirstName').value = student.firstName;
        document.getElementById('editLastName').value = student.lastName;
        document.getElementById('editDateOfBirth').value = formatDateForInput(student.dateOfBirth);
        document.getElementById('editGender').value = student.gender;
        document.getElementById('editGrade').value = student.grade;
        document.getElementById('editSection').value = student.section || '';
        document.getElementById('editPreviousSchool').value = student.previousSchool || '';
        document.getElementById('editAdmissionDate').value = formatDateForInput(student.enrollmentDate);
        document.getElementById('editParentName').value = student.parentName;
        document.getElementById('editParentRelationship').value = student.parentRelationship || '';
        document.getElementById('editParentEmail').value = student.parentEmail;
        document.getElementById('editParentPhone').value = student.parentPhone;
        document.getElementById('editAddress').value = student.street || '';
        
        // Show the edit modal
        document.getElementById('editStudentModal').style.display = 'block';

        // Add event listener for edit form submission
        document.getElementById('editStudentForm').addEventListener('submit', function(event) {
            event.preventDefault();
            updateStudent(student.id);
        });
    })
    .catch(error => {
        console.error('Error fetching student details for edit:', error);
        alert('Failed to load student details for editing');
    });
}

// Function to update student
function updateStudent(id) {
    const formData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        dateOfBirth: document.getElementById('editDateOfBirth').value,
        gender: document.getElementById('editGender').value,
        grade: document.getElementById('editGrade').value,
        section: document.getElementById('editSection').value,
        previousSchool: document.getElementById('editPreviousSchool').value || null,
        enrollmentDate: document.getElementById('editAdmissionDate').value,
        parentName: document.getElementById('editParentName').value,
        parentRelationship: document.getElementById('editParentRelationship').value,
        parentEmail: document.getElementById('editParentEmail').value,
        parentPhone: document.getElementById('editParentPhone').value,
        street: document.getElementById('editAddress').value
    };
    
    fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
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
        document.getElementById('editStudentModal').style.display = 'none';
        fetchStudents(); // Refresh the student list
    })
    .catch(error => {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
    });
}

// Function to delete student
function deleteStudent(id) {
    fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete student');
        }
        return response.json();
    })
    .then(data => {
        alert('Student deleted successfully');
        fetchStudents(); // Refresh the student list
    })
    .catch(error => {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
    });
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function capitalizeFirstLetter(string) {
    if (!string) return 'N/A';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Setup modal close listeners
function setupModalCloseListeners() {
    // View modal close buttons
    document.querySelector('#viewStudentModal .close').addEventListener('click', function() {
        document.getElementById('viewStudentModal').style.display = 'none';
    });
    
    document.querySelector('#viewStudentModal .cancel-btn').addEventListener('click', function() {
        document.getElementById('viewStudentModal').style.display = 'none';
    });
    
    // Edit modal close buttons
    document.querySelector('#editStudentModal .close').addEventListener('click', function() {
        document.getElementById('editStudentModal').style.display = 'none';
    });
    
    document.querySelector('#editStudentModal .cancel-btn').addEventListener('click', function() {
        document.getElementById('editStudentModal').style.display = 'none';
    });
    
    // Add modal close buttons
    document.querySelector('#addStudentModal .close').addEventListener('click', function() {
        document.getElementById('addStudentModal').style.display = 'none';
        document.getElementById('addStudentForm').reset();
    });
    
    document.querySelector('#addStudentModal .cancel-btn').addEventListener('click', function() {
        document.getElementById('addStudentModal').style.display = 'none';
        document.getElementById('addStudentForm').reset();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('viewStudentModal')) {
            document.getElementById('viewStudentModal').style.display = 'none';
        }
        if (event.target === document.getElementById('editStudentModal')) {
            document.getElementById('editStudentModal').style.display = 'none';
        }
        if (event.target === document.getElementById('addStudentModal')) {
            document.getElementById('addStudentModal').style.display = 'none';
            document.getElementById('addStudentForm').reset();
        }
    });
}