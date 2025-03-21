document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const loginButton = document.querySelector('button[type="submit"]');
    const originalButtonText = loginButton.textContent;
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important for cookies
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            if (rememberMe) {
                localStorage.setItem('teacherToken', data.token);
            } else {
                sessionStorage.setItem('teacherToken', data.token);
            }
            window.location.href = 'dashboard.html';
        } else {
            throw new Error('No token received');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        const errorMessage = error.message || error.error || 'An error occurred during login. Please try again.';
        alert(errorMessage);
    })
    .finally(() => {
        // Reset button state
        loginButton.textContent = originalButtonText;
        loginButton.disabled = false;
    });
});