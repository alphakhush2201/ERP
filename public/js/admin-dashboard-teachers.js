// Import API configuration
import { API_URL } from './config.js';

// DOM Elements
const addTeacherForm = document.getElementById('addTeacherForm');
const teacherGrid = document.querySelector('.teacher-grid');
const modal = document.querySelector('.modal');
const closeModalBtn = document.querySelector('.close-modal');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadTeachers);
addTeacherForm.addEventListener('submit', handleAddTeacher);
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Load teachers
async function loadTeachers() {
    try {
        const response = await fetch(`${API_URL}/teachers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch teachers');
        }
        
        const teachers = await response.json();
        displayTeachers(teachers);
    } catch (error) {
        console.error('Error loading teachers:', error);
        alert('Failed to load teachers. Please try again.');
    }
}

// Display teachers
function displayTeachers(teachers) {
    teacherGrid.innerHTML = teachers.map(teacher => `
        <div class="teacher-card" data-id="${teacher.id}">
            <h3>${teacher.name}</h3>
            <div class="teacher-info">
                <p>Email: ${teacher.email}</p>
                <p>Subject: ${teacher.subject}</p>
                <p>Phone: ${teacher.phone}</p>
            </div>
            <div class="teacher-actions">
                <button class="btn btn-primary" onclick="editTeacher(${teacher.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTeacher(${teacher.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Handle add teacher form submission
async function handleAddTeacher(e) {
    e.preventDefault();
    
    const formData = new FormData(addTeacherForm);
    const teacherData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_URL}/teachers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(teacherData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add teacher');
        }
        
        const result = await response.json();
        alert('Teacher added successfully!');
        modal.style.display = 'none';
        addTeacherForm.reset();
        loadTeachers();
    } catch (error) {
        console.error('Error adding teacher:', error);
        alert('Failed to add teacher. Please try again.');
    }
}

// Edit teacher
async function editTeacher(teacherId) {
    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch teacher details');
        }
        
        const teacher = await response.json();
        
        // Populate form with teacher data
        Object.keys(teacher).forEach(key => {
            const input = addTeacherForm.elements[key];
            if (input) {
                input.value = teacher[key];
            }
        });
        
        // Update form for edit mode
        addTeacherForm.dataset.mode = 'edit';
        addTeacherForm.dataset.teacherId = teacherId;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        alert('Failed to load teacher details. Please try again.');
    }
}

// Delete teacher
async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete teacher');
        }
        
        alert('Teacher deleted successfully!');
        loadTeachers();
    } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher. Please try again.');
    }
}

// Show add teacher modal
window.showAddTeacherModal = function() {
    addTeacherForm.reset();
    addTeacherForm.dataset.mode = 'add';
    delete addTeacherForm.dataset.teacherId;
    modal.style.display = 'block';
}; 