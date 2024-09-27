async function addProduct(event) {
    event.preventDefault();
    
    const productName = document.querySelector("#productName").value;
    const metrics = document.querySelector("#metrics").value;
    const quantity = document.querySelector("#quantity").value;
    const expirationDate = document.querySelector("#expirationDate").value;
    const location = document.querySelector("#location").value;
    const image = document.querySelector("#image").value; 

    const response = await fetch('/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('JAmie12!@')}`
        },
        body: JSON.stringify({ productName, metrics, quantity, expirationDate, location, image })
    });

    // Check response status
    if (!response.ok) {
        const errorText = await response.text(); // Read response as text
        alert(`Error: ${errorText}`); // Show error message
        return; // Exit the function early
    }

    const result = await response.json(); // Only parse as JSON if response is OK
    alert('Product added successfully!');
    window.location.href = 'view-products.html';
}
