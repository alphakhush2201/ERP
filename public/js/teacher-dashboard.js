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
    
    // Fetch dashboard data from API
    fetchDashboardData();
});

// Function to fetch dashboard data
function fetchDashboardData() {
    fetch('/api/teacher-dashboard', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        return response.json();
    })
    .then(data => {
        // Update dashboard with real data
        updateDashboardStats(data.stats);
        updateUpcomingClasses(data.classes);
        updateAnnouncements(data.announcements);
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
    });
}

function updateDashboardStats(stats) {
    if (!stats) return;
    
    const statElements = document.querySelectorAll('.stat-card .stat-number');
    if (stats.totalStudents) statElements[0].textContent = stats.totalStudents;
    if (stats.classesToday) statElements[1].textContent = stats.classesToday;
    if (stats.assignments) statElements[2].textContent = stats.assignments;
    if (stats.announcements) statElements[3].textContent = stats.announcements;
}

function updateUpcomingClasses(classes) {
    if (!classes || !classes.length) return;
    
    const classList = document.querySelector('.class-list');
    classList.innerHTML = '';
    
    classes.forEach(cls => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="class-time">${cls.time}</span>
            <span class="class-name">${cls.name} - ${cls.grade}</span>
        `;
        classList.appendChild(li);
    });
}

function updateAnnouncements(announcements) {
    if (!announcements || !announcements.length) return;
    
    const announcementsContainer = document.querySelector('.widget:nth-child(2)');
    announcementsContainer.innerHTML = '<h3>Recent Announcements</h3>';
    
    announcements.forEach(announcement => {
        const div = document.createElement('div');
        div.className = 'announcement';
        div.innerHTML = `
            <h4>${announcement.title}</h4>
            <p>${announcement.content}</p>
            <span class="announcement-date">${announcement.date}</span>
        `;
        announcementsContainer.appendChild(div);
    });
}