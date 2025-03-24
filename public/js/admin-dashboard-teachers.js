// API Configuration
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const teachersTableBody = document.getElementById('teachersTableBody');
const teacherModal = document.getElementById('teacherModal');
const teacherForm = document.getElementById('teacherForm');
const addTeacherBtn = document.getElementById('addTeacherBtn');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');

// State
let teachers = [];
let currentTeacherId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchTeachers();
    setupEventListeners();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../auth/admin-login.html';
        return;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Add Teacher Button
    addTeacherBtn.addEventListener('click', () => {
        currentTeacherId = null;
        teacherForm.reset();
        document.getElementById('modalTitle').textContent = 'Add New Teacher';
        teacherModal.style.display = 'block';
    });

    // Close Modal Button
    document.querySelector('.close-btn').addEventListener('click', closeModal);

    // Form Submit
    teacherForm.addEventListener('submit', handleSubmit);

    // Search Input
    searchInput.addEventListener('input', handleSearch);
}

// Fetch Teachers
async function fetchTeachers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../auth/admin-login.html';
            return;
        }

        const response = await fetch(`${API_URL}/teachers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../auth/admin-login.html';
                return;
            }
            throw new Error('Failed to fetch teachers');
        }

        const data = await response.json();
        teachers = data;
        renderTeachers(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        showError('Failed to fetch teachers. Please try again.');
    }
}

// Render Teachers
function renderTeachers(teachersToRender) {
    if (!Array.isArray(teachersToRender) || teachersToRender.length === 0) {
        teachersTableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    teachersTableBody.innerHTML = teachersToRender.map(teacher => `
        <tr>
            <td>${teacher.firstName} ${teacher.lastName}</td>
            <td>${teacher.email}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.role}</td>
            <td>${Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects}</td>
            <td><span class="status-badge status-${teacher.status.toLowerCase()}">${teacher.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editTeacher(${teacher.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteTeacher(${teacher.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Handle Form Submit
async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(teacherForm);
    const teacherData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        qualification: formData.get('qualification'),
        role: formData.get('role'),
        subjects: formData.get('subjects').split(',').map(s => s.trim()).filter(Boolean),
        experience: parseInt(formData.get('experience')),
        salary: parseFloat(formData.get('salary')),
        status: formData.get('status')
    };

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('Authentication token not found. Please login again.');
            window.location.href = '../auth/admin-login.html';
            return;
        }

        const url = currentTeacherId 
            ? `${API_URL}/teachers/${currentTeacherId}`
            : `${API_URL}/teachers`;
        
        const method = currentTeacherId ? 'PUT' : 'POST';

        console.log('Sending request:', {
            url,
            method,
            data: teacherData
        });

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(teacherData)
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../auth/admin-login.html';
                return;
            }
            throw new Error(responseData.message || 'Failed to save teacher');
        }

        closeModal();
        await fetchTeachers();
        showSuccess(currentTeacherId ? 'Teacher updated successfully' : 'Teacher added successfully');
    } catch (error) {
        console.error('Error saving teacher:', error);
        showError(error.message || 'Failed to save teacher. Please try again.');
    }
}

// Edit Teacher
async function editTeacher(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../auth/admin-login.html';
            return;
        }

        const response = await fetch(`${API_URL}/teachers/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../auth/admin-login.html';
                return;
            }
            throw new Error('Failed to fetch teacher details');
        }

        const teacher = await response.json();
        currentTeacherId = teacher.id;

        // Populate form
        document.getElementById('firstName').value = teacher.firstName || '';
        document.getElementById('lastName').value = teacher.lastName || '';
        document.getElementById('email').value = teacher.email || '';
        document.getElementById('phone').value = teacher.phone || '';
        document.getElementById('dateOfBirth').value = teacher.dateOfBirth || '';
        document.getElementById('gender').value = teacher.gender || '';
        document.getElementById('qualification').value = teacher.qualification || '';
        document.getElementById('role').value = teacher.role || '';
        document.getElementById('subjects').value = Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : '';
        document.getElementById('experience').value = teacher.experience || '';
        document.getElementById('salary').value = teacher.salary || '';
        document.getElementById('status').value = teacher.status || 'active';

        document.getElementById('modalTitle').textContent = 'Edit Teacher';
        teacherModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        showError('Failed to fetch teacher details. Please try again.');
    }
}

// Delete Teacher
async function deleteTeacher(id) {
    if (!confirm('Are you sure you want to delete this teacher?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../auth/admin-login.html';
            return;
        }

        const response = await fetch(`${API_URL}/teachers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../auth/admin-login.html';
                return;
            }
            throw new Error('Failed to delete teacher');
        }

        await fetchTeachers();
        showSuccess('Teacher deleted successfully');
    } catch (error) {
        console.error('Error deleting teacher:', error);
        showError('Failed to delete teacher. Please try again.');
    }
}

// Handle Search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredTeachers = teachers.filter(teacher => 
        teacher.firstName.toLowerCase().includes(searchTerm) ||
        teacher.lastName.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm) ||
        teacher.role.toLowerCase().includes(searchTerm)
    );
    renderTeachers(filteredTeachers);
}

// Close Modal
function closeModal() {
    teacherModal.style.display = 'none';
    teacherForm.reset();
    currentTeacherId = null;
}

// Show Success Message
function showSuccess(message) {
    // You can implement a toast or notification system here
    alert(message);
}

// Show Error Message
function showError(message) {
    // You can implement a toast or notification system here
    alert(message);
} 