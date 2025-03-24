// Toast Notifications
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
};

// Form Validation
const validateForm = (form) => {
    const errors = {};
    Array.from(form.elements).forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
            const error = validateField(element);
            if (error) {
                errors[element.name] = error;
            }
        }
    });
    return errors;
};

const validateField = (field) => {
    if (field.required && !field.value) {
        return 'This field is required';
    }

    if (field.type === 'email' && field.value) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(field.value)) {
            return 'Please enter a valid email address';
        }
    }

    if (field.type === 'tel' && field.value) {
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(field.value)) {
            return 'Please enter a valid 10-digit phone number';
        }
    }

    if (field.type === 'number') {
        const value = Number(field.value);
        if (field.min && value < Number(field.min)) {
            return `Value must be at least ${field.min}`;
        }
        if (field.max && value > Number(field.max)) {
            return `Value must be no more than ${field.max}`;
        }
    }

    if (field.minLength && field.value.length < Number(field.minLength)) {
        return `Must be at least ${field.minLength} characters`;
    }

    if (field.maxLength && field.value.length > Number(field.maxLength)) {
        return `Must be no more than ${field.maxLength} characters`;
    }

    return null;
};

// Show form errors
const showFormErrors = (form, errors) => {
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));

    // Show new errors
    Object.entries(errors).forEach(([fieldName, error]) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const formGroup = field.closest('.form-group');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = error;
                formGroup.classList.add('has-error');
            }
        }
    });
};

// Loading State Management
const setLoading = (isLoading) => {
    const loadingState = document.getElementById('loadingState');
    const tableContainer = document.getElementById('tableContainer');
    const errorState = document.getElementById('errorState');

    if (isLoading) {
        loadingState.style.display = 'flex';
        tableContainer.style.display = 'none';
        errorState.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        tableContainer.style.display = 'block';
    }
};

// Error State Management
const setError = (show, message = '') => {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const tableContainer = document.getElementById('tableContainer');
    const loadingState = document.getElementById('loadingState');

    if (show) {
        errorState.style.display = 'flex';
        errorMessage.textContent = message;
        tableContainer.style.display = 'none';
        loadingState.style.display = 'none';
    } else {
        errorState.style.display = 'none';
    }
};

// Button Loading State
const setButtonLoading = (button, isLoading) => {
    const buttonText = button.querySelector('.button-text');
    const buttonLoader = button.querySelector('.button-loader');
    
    button.disabled = isLoading;
    if (isLoading) {
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline-block';
    } else {
        buttonText.style.display = 'inline-block';
        buttonLoader.style.display = 'none';
    }
};

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Debounce function for search
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}; 