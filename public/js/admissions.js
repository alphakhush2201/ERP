document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.admission-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Get form data including the terms checkbox
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            // For checkbox, we need to send its checked state
            if (key === 'terms') {
                data[key] = formData.get(key) === 'on';
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
                throw new Error(`HTTP error! status: ${response.status}`);
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
            alert('An error occurred while submitting your inquiry. Please try again later.');
        });
    });
});