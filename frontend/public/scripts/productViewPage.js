// product-view.js

// Fetch and display products
async function loadProducts() {
    const response = await fetch('http://localhost:3000/products', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const products = await response.json();
    const productContainer = document.querySelector("#product-container");

    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.productName}">
                <h3>${product.productName}</h3>
                <p>${product.quantity} ${product.metrics}</p>
                <p>Expires: ${product.expirationDate}</p>
                <p>Location: ${product.location}</p>
                <button onclick="claimProduct(${product.productID})">Claim</button>
            </div>
        `;
        productContainer.innerHTML += productCard;
    });
}

// Claim a product
async function claimProduct(productID) {
    const response = await fetch('http://localhost:3000/claim', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productID })
    });

    const result = await response.json();
    if (response.ok) {
        alert('Product claimed successfully!');
    } else {
        alert(result.message);
    }
}
