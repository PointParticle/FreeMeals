// apps.js

//register
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
    const address = document.querySelector("#address").value;
    const location = document.querySelector("#location").value;
    const role = document.querySelector("#role").value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, address, location, role })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('Registration successful!');
            window.location.href = 'login.html'; // Redirect to login page after successful registration
        } else if (result.redirect) {  // Handle user exists case
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

//login
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
                    window.location.href = 'notifications.html'; // Redirect to notifications page
                    break;
                case 'donor':
                    window.location.href = 'donor-dashboard.html'; // Redirect to donor dashboard
                    break;
                case 'receiver':
                    window.location.href = 'productViewPage.html'; // Redirect to product view page
                    break;
                default:
                    window.location.href = 'index.html'; // Default redirect
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



// Logout function
function logoutUser() {
    fetch('/logout', { method: 'POST' })
        .then(() => {
            localStorage.clear();
            alert('Logout successful!');
            window.location.href = '/html/index.html';
        });
}
