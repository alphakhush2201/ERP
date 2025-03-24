// DOM Elements
const teacherModal = document.getElementById('teacherModal');
const teacherForm = document.getElementById('teacherForm');
const teacherSearch = document.getElementById('teacherSearch');
const teachersTableBody = document.getElementById('teachersTableBody');
const modalTitle = document.getElementById('modalTitle');

// State
let teachers = [];
let editingTeacherId = null;

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Fetch all teachers
async function fetchTeachers() {
    try {
        const response = await fetch(`${API_URL}/teachers`, {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            teachers = data.data;
            renderTeachers();
        }
    } catch (error) {
        console.error('Error fetching teachers:', error);
        alert('Failed to load teachers');
    }
}

// Render teachers table
function renderTeachers() {
    const searchTerm = teacherSearch.value.toLowerCase();
    
    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        return fullName.includes(searchTerm) || 
               teacher.email.toLowerCase().includes(searchTerm) ||
               teacher.phone.includes(searchTerm);
    });

    teachersTableBody.innerHTML = filteredTeachers.map(teacher => `
        <tr>
            <td>${teacher.firstName} ${teacher.lastName}</td>
            <td>${teacher.email}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.role}</td>
            <td>
                <span class="status-badge ${teacher.status.toLowerCase()}">
                    ${teacher.status}
                </span>
            </td>
            <td>
                <button onclick="editTeacher(${teacher.id})" class="action-btn edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTeacher(${teacher.id})" class="action-btn delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open add teacher modal
function openAddModal() {
    editingTeacherId = null;
    modalTitle.textContent = 'Add Teacher';
    teacherForm.reset();
    teacherModal.style.display = 'block';
}

// Open edit teacher modal
async function editTeacher(teacherId) {
    editingTeacherId = teacherId;
    modalTitle.textContent = 'Edit Teacher';

    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    // Fill form with teacher data
    Object.keys(teacher).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            if (key === 'subjects') {
                input.value = Array.isArray(teacher[key]) ? teacher[key].join(', ') : teacher[key];
            } else {
                input.value = teacher[key];
            }
        }
    });

    teacherModal.style.display = 'block';
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(teacherForm);
    const teacherData = Object.fromEntries(formData.entries());

    try {
        const url = editingTeacherId 
            ? `${API_URL}/teachers/${editingTeacherId}`
            : `${API_URL}/teachers`;
        
        const method = editingTeacherId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(teacherData)
        });

        const data = await response.json();

        if (data.success) {
            await fetchTeachers();
            closeModal();
            alert(editingTeacherId ? 'Teacher updated successfully' : 'Teacher added successfully');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error saving teacher:', error);
        alert('Failed to save teacher');
    }
}

// Delete teacher
async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            await fetchTeachers();
            alert('Teacher deleted successfully');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher');
    }
}

// Close modal
function closeModal() {
    teacherModal.style.display = 'none';
    teacherForm.reset();
    editingTeacherId = null;
}

// Event Listeners
teacherSearch.addEventListener('input', renderTeachers);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === teacherModal) {
        closeModal();
    }
});

// Initial load
fetchTeachers(); 