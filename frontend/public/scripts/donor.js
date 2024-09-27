// donor.js

// Add product
async function addProduct(event) {
    event.preventDefault();
    const productName = document.querySelector("#productName").value;
    const metrics = document.querySelector("#metrics").value;
    const quantity = document.querySelector("#quantity").value;
    const expirationDate = document.querySelector("#expirationDate").value;
    const location = document.querySelector("#location").value;
    const image = document.querySelector("#image").value; // Handle image upload in a real scenario

    const response = await fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productName, metrics, quantity, expirationDate, location, image })
    });

    const result = await response.json();
    if (response.ok) {
        alert('Product added successfully!');
        window.location.reload();
    } else {
        alert(result.message);
    }
}
