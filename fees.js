// Global variables
let currentPage = 1;
let feesPerPage = 10;
let totalFees = 0;

// Function to fetch fees data
function fetchFees() {
  console.log('Fetching fees data...');
  const searchQuery = document.getElementById('searchInput')?.value || '';
  const gradeFilter = document.getElementById('gradeFilter')?.value || '';
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  
  const token = localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken');
  
  fetch(`/api/fees?page=${currentPage}&limit=${feesPerPage}&search=${searchQuery}&grade=${gradeFilter}&status=${statusFilter}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Failed to fetch fees data: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Fees data received:', data);
    displayFees(data.fees);
    updateSummary(data.summary);
    totalFees = data.total;
    setupPagination();
  })
  .catch(error => {
    console.error('Error fetching fees data:', error);
  });
}

// Function to display fees in the table
function displayFees(fees) {
  const feesTableBody = document.querySelector('.fees-table tbody');
  if (!feesTableBody) {
    console.error('Fees table body not found');
    return;
  }
  
  if (!fees || fees.length === 0) {
    feesTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="no-data">No fee records found</td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  
  fees.forEach(fee => {
    const dueDate = new Date(fee.due_date).toLocaleDateString();
    let statusClass = '';
    
    if (fee.status === 'paid') {
      statusClass = 'status-paid';
    } else if (fee.status === 'pending') {
      statusClass = 'status-pending';
    } else if (fee.status === 'overdue') {
      statusClass = 'status-overdue';
    }
    
    html += `
      <tr>
        <td>${fee.student_id || ''}</td>
        <td>${fee.student_name || ''}</td>
        <td>${fee.grade || ''}</td>
        <td>${fee.fee_type || ''}</td>
        <td>$${parseFloat(fee.amount).toFixed(2)}</td>
        <td>${dueDate}</td>
        <td><span class="status ${statusClass}">${fee.status}</span></td>
        <td>
          <button class="view-btn" data-id="${fee.id}">View</button>
          <button class="edit-btn" data-id="${fee.id}">Edit</button>
        </td>
      </tr>
    `;
  });
  
  feesTableBody.innerHTML = html;
}

// Function to update summary data
function updateSummary(summary) {
  if (!summary) return;
  
  document.getElementById('totalCollected').textContent = `$${parseFloat(summary.totalCollected).toFixed(2)}`;
  document.getElementById('pendingAmount').textContent = `$${parseFloat(summary.pendingAmount).toFixed(2)}`;
  document.getElementById('overdueAmount').textContent = `$${parseFloat(summary.overdueAmount).toFixed(2)}`;
  document.getElementById('studentsPaid').textContent = `${summary.studentsPaid}/${summary.totalStudents}`;
}

// Function to set up pagination
function setupPagination() {
  const totalPages = Math.ceil(totalFees / feesPerPage);
  const paginationElement = document.querySelector('.pagination');
  
  if (!paginationElement) {
    console.error('Pagination element not found');
    return;
  }
  
  let paginationHtml = '';
  
  if (totalPages > 1) {
    paginationHtml += `
      <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
        ${currentPage === 1 ? 'disabled' : ''} data-page="prev">Previous</button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <button class="pagination-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>
      `;
    }
    
    paginationHtml += `
      <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
        ${currentPage === totalPages ? 'disabled' : ''} data-page="next">Next</button>
    `;
  }
  
  paginationElement.innerHTML = paginationHtml;
  
  // Add event listeners to pagination buttons
  document.querySelectorAll('.pagination-btn').forEach(button => {
    button.addEventListener('click', function() {
      if (this.disabled) return;
      
      const page = this.getAttribute('data-page');
      
      if (page === 'prev') {
        currentPage--;
      } else if (page === 'next') {
        currentPage++;
      } else {
        currentPage = parseInt(page);
      }
      
      fetchFees();
    });
  });
}

// Function to open payment modal
function openPaymentModal() {
  console.log('Opening payment modal');
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.style.display = 'block';
    fetchStudentsForDropdown();
    
    // Set default dates
    const today = new Date();
    const paymentDateInput = document.getElementById('paymentDate');
    if (paymentDateInput) {
      paymentDateInput.valueAsDate = today;
    }
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default due date is 30 days from now
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
      dueDateInput.valueAsDate = dueDate;
    }
  } else {
    console.error('Payment modal element not found');
  }
}

// Function to close payment modal
function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('paymentForm').reset();
  }
}

// Function to fetch students for dropdown
function fetchStudentsForDropdown() {
  console.log('Fetching students for dropdown...');
  
  const token = localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken');
  
  fetch('/api/students', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    return response.json();
  })
  .then(data => {
    console.log('Students data received:', data);
    const studentSelect = document.getElementById('studentSelect');
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    
    if (data.students && Array.isArray(data.students)) {
      data.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.student_id} - ${student.first_name} ${student.last_name} (${student.grade})`;
        studentSelect.appendChild(option);
      });
      console.log(`Added ${data.students.length} students to dropdown`);
    } else {
      console.warn('No students found or invalid data format');
    }
  })
  .catch(error => {
    console.error('Error fetching students:', error);
  });
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners');
  
  // Check if user is logged in
  const token = localStorage.getItem('teacherToken') || sessionStorage.getItem('teacherToken');
  if (!token) {
    window.location.href = '/teacher-login';
    return;
  }
  
  // Initialize the page
  fetchFees();
  
  // Add "Record Payment" button to the page
  const feesContainer = document.querySelector('.fees-container');
  if (feesContainer) {
    const addFeeBtn = document.createElement('button');
    addFeeBtn.id = 'addFeeBtn';
    addFeeBtn.className = 'add-fee-btn';
    addFeeBtn.textContent = 'Record Payment';
    addFeeBtn.addEventListener('click', openPaymentModal);
    
    // Insert button at the top of the fees container
    feesContainer.insertBefore(addFeeBtn, feesContainer.firstChild);
    console.log('Record Payment button added to the page');
  }
  
  // Add event listener to close button in modal
  const closeBtn = document.querySelector('#paymentModal .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePaymentModal);
  }
  
  // Add event listener to cancel button in form
  const cancelBtn = document.querySelector('#paymentForm .cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closePaymentModal);
  }
  
  // Add event listener to payment form submission
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form data
      const studentId = document.getElementById('studentSelect').value;
      const feeType = document.getElementById('feeType').value;
      const amount = document.getElementById('amount').value;
      const dueDate = document.getElementById('dueDate').value;
      const paymentDate = document.getElementById('paymentDate').value || null;
      const paymentMethod = document.getElementById('paymentMethod').value || null;
      const notes = document.getElementById('notes').value || null;
      
      // Validate required fields
      if (!studentId || !feeType || !amount || !dueDate) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Determine status based on payment date
      const status = paymentDate ? 'paid' : 'pending';
      
      // Create fee object
      const formData = {
        studentId,
        feeType,
        amount,
        dueDate,
        paymentDate,
        paymentMethod,
        notes,
        status
      };
      
      console.log('Sending payment data:', formData);
      
      // Submit data to API
      fetch('/api/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Failed to record payment: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Payment recorded successfully:', data);
        alert('Payment recorded successfully');
        closePaymentModal();
        fetchFees(); // Refresh the fees list
      })
      .catch(error => {
        console.error('Error recording payment:', error);
        alert('Failed to record payment: ' + error.message);
      });
    });
  }
  
  // Set current date in header
  const currentDateElement = document.getElementById('currentDate');
  if (currentDateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
  
  // Add event listener to logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('teacherToken');
      sessionStorage.removeItem('teacherToken');
      window.location.href = '/teacher-login';
    });
  }
});