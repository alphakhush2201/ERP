document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.admission-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Get form data including the terms checkbox
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key === 'terms') {
                // Convert checkbox to boolean string for validation
                data[key] = formData.get(key) === 'on' ? 'true' : 'false';
            } else {
                data[key] = value;
            }
        });
        
        console.log('Sending data:', data);
        
        fetch('/api/send-admission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.errors ? err.errors.map(e => e.msg).join(', ') : 'Submission failed');
                });
            }
            return response.json();
        })
        .then(result => {
            console.log('Response data:', result);
            if (result.message) {
                alert('Thank you! Your admission inquiry has been submitted successfully.');
                form.reset();
            } else {
                alert('Error: ' + (result.error || 'Failed to submit inquiry'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while submitting your inquiry. Please try again later.');
        });
    });
});