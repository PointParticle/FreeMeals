document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

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
            document.getElementById("error-message").textContent = result.message;
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
    }
}

// Login function
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
            localStorage.setItem('token', result.token); // Store token correctly
            window.location.href = 'view-products.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
}
