async function addProduct(event) {
    event.preventDefault();
    
    const productName = document.querySelector("#productName").value;
    const metrics = document.querySelector("#metrics").value;
    const quantity = document.querySelector("#quantity").value;
    const expirationDate = document.querySelector("#expirationDate").value;
    const location = document.querySelector("#location").value;
    const image = document.querySelector("#image").value; 

    // Validate input before sending the request
    if (!productName || !metrics || !quantity || !expirationDate || !location) {
        alert('Please fill in all required fields.');
        return; // Exit if validation fails
    }

    const response = await fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure the token is stored with the correct key
        },
        body: JSON.stringify({ productName, metrics, quantity, expirationDate, location, image })
    });

    // Check response status
    if (!response.ok) {
        const errorText = await response.text(); // Read response as text
        alert(`Error adding product: ${errorText}`); // Show error message
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
    document.querySelector("#image").value = '';

    // Redirect to view products page after a short delay (optional)
    setTimeout(() => {
        window.location.href = 'view-products.html';
    }, 1000); // Redirect after 1 second
}
