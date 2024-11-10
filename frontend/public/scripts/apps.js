// Register User
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
});

// Registration function
async function registerUser(event) {
    event.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const phoneNumber = document.querySelector("#phoneNumber").value;
    const location = document.querySelector("#location").value;
    const role = document.querySelector("#role").value;

    const loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.style.display = "block"; 

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phoneNumber, location, role })
        });

        const result = await response.json();
        loadingIndicator.style.display = "none"; 

        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = 'login.html'; 
        } else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.textContent = result.message; 
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
    }
}

// Login function
async function login(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Validate input before sending the request
    if (!email || !password) {
        alert('Please fill in both fields.');
        return; // Exit if validation fails
    }

    // Send login data to the server
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }) // Send email and password as JSON
    });

    // Check response status
    if (!response.ok) {
        const errorText = await response.text();
        alert(`Login failed: ${errorText}`);
        return; // Exit the function if login fails
    }

    const result = await response.json();

    // Save the token in localStorage if login is successful
    localStorage.setItem('token', result.token); // Store the token

    // Optionally, store the role or other user information if needed
    localStorage.setItem('role', result.role);

    // Redirect to the dashboard or other page after successful login
    window.location.href = 'donor-dashboard.html';
}

