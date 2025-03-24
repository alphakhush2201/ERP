// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const [studentsResponse, teachersResponse] = await Promise.all([
            fetch('/api/students'),
            fetch('/api/teachers')
        ]);

        const studentsData = await studentsResponse.json();
        const teachersData = await teachersResponse.json();

        if (studentsData.success && teachersData.success) {
            updateStatCards(studentsData.data.length, teachersData.data.length);
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

// Update stat cards with real data
function updateStatCards(studentCount, teacherCount) {
    const studentCountElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const teacherCountElement = document.querySelector('.stat-card:nth-child(2) .stat-number');

    if (studentCountElement) {
        studentCountElement.textContent = studentCount.toLocaleString();
    }

    if (teacherCountElement) {
        teacherCountElement.textContent = teacherCount.toLocaleString();
    }
}

// Initial load
fetchDashboardStats(); 