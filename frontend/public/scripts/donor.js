async function addProduct(event) {
    event.preventDefault();

    const productName = document.querySelector("#productName").value;
    const metrics = document.querySelector("#metrics").value;
    const quantity = document.querySelector("#quantity").value;
    const expirationDate = document.querySelector("#expirationDate").value;
    const location = document.querySelector("#location").value;
    const image = document.querySelector("#image").files[0]; // Get the file from the file input

    // Validate input before sending the request
    if (!productName || !metrics || !quantity || !expirationDate || !location || !image) {
        alert('Please fill in all required fields and upload an image.');
        return; // Exit if validation fails
    }

    // Create a new FormData object to send the data
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('metrics', metrics);
    formData.append('quantity', quantity);
    formData.append('expirationDate', expirationDate);
    formData.append('location', location);
    formData.append('image', image); // Append the image file

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If no token, alert the user and exit
    if (!token) {
        alert('You need to log in first.');
        return;
    }

    // Send the data to the server with the token in the Authorization header
    const response = await fetch('/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Send the token
        },
        body: formData // Use FormData as the body of the request
    });

    // Check response status
    if (!response.ok) {
        const errorText = await response.text();
        alert(`Error adding product: ${errorText}`);
        return; // Exit the function early
    }

    const result = await response.json(); // Only parse as JSON if response is OK
    alert('Product added successfully!'); // Notify the user

    // Optionally, clear the form fields after adding
    document.querySelector("#productName").value = '';
    document.querySelector("#metrics").value = '';
    document.querySelector("#quantity").value = '';
    document.querySelector("#expirationDate").value = '';
    document.querySelector("#location").value = '';
    document.querySelector("#image").value = ''; // Clear the file input

    // Redirect to view products page after a short delay (optional)
    setTimeout(() => {
        window.location.href = 'view-products.html';
    }, 1000); // Redirect after 1 second
}
