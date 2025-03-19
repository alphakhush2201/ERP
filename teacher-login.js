document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        if (rememberMe) {
            localStorage.setItem('teacherToken', data.token);
        } else {
            sessionStorage.setItem('teacherToken', data.token);
        }
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.error || 'Please try again'));
    });
});