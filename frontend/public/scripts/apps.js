// apps.js

// Register User
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }
});

async function registerUser(event) {
    event.preventDefault();
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const phoneNumber = document.querySelector("#phoneNumber").value; // Corrected variable name
    const location = document.querySelector("#location").value;
    const role = document.querySelector("#role").value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phoneNumber, location, role }) // Use phoneNumber here
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = 'login.html'; // Redirect to login page after successful registration
        } else if (result.redirect) {  // Handle user already exists case
            alert(result.message);
            window.location.href = 'login.html'; // Redirect to login page for existing accounts
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.'); // Handle fetch errors
    }
}

// Login User
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
});

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
            
            // Redirect based on user role
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
                    alert('Unknown user role. Please contact support.'); // Handle unexpected roles
                    break;
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.'); // Handle fetch errors
    }
}

// Logout User
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
            alert('An error occurred while logging out.'); // Handle fetch errors
        });
}
