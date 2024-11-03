// apps.js

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

async function registerUser(event) {
    event.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const phoneNumber = document.querySelector("#phoneNumber").value;
    const location = document.querySelector("#location").value;
    const role = document.querySelector("#role").value;

    const loadingIndicator = document.getElementById("loadingIndicator");
    loadingIndicator.style.display = "block"; // Show loading indicator

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phoneNumber, location, role })
        });

        const result = await response.json();
        loadingIndicator.style.display = "none"; // Hide loading indicator

        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = 'login.html'; // Redirect to login page after successful registration
        } else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.textContent = result.message; // Display error message inline
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Login successful!');
            switch (result.role) {
                case 'admin':
                    window.location.href = 'donor-dashboard.html'; // Redirect to admin dashboard
                    break;
                case 'donor':
                    window.location.href = 'donor-dashboard.html'; // Redirect to donor dashboard
                    break;
                case 'receiver':
                    window.location.href = 'view-products.html'; // Redirect to receiver dashboard
                    break;
                default:
                    alert('Unknown user role. Please contact support.');
                    break;
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
}

function logoutUser() {
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                localStorage.clear(); // Clear any stored user info
                alert('Logout successful!');
                window.location.href = 'index.html'; // Redirect to login page
            } else {
                alert('Logout failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert('An error occurred while logging out.');
        });
}
