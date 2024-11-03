// productViewPage.js

async function loadProducts() {
    try {
        const response = await fetch('/products', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'), // Add JWT token if required
            },
        });
        const products = await response.json();
        const productContainer = document.getElementById('product-container');
        
        productContainer.innerHTML = ''; // Clear existing products

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <h3>${product.productName}</h3>
                <img src="${product.image || 'path/to/default-image.jpg'}" alt="No picture available" class="product-image">
                <p>Quantity: <span id="qty-${product.productID}">${product.quantity}</span> ${product.metrics}</p>
                <p>Expires on: ${new Date(product.expirationDate).toLocaleDateString()}</p>
                <button onclick="viewProduct(${product.productID})">View Details</button>
                <button onclick="claimProduct(${product.productID})">Claim Product</button>
            `;
            productContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Failed to load products. Please try again later.');
    }
}

async function claimProduct(productID) {
    try {
        const response = await fetch('/claim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'), // Add JWT token if required
            },
            body: JSON.stringify({ productID }),
        });
        
        if (response.ok) {
            alert('Successfully claimed the product!');
            updateProductQuantity(productID);
            loadProducts(); // Reload products to reflect the claim
        } else {
            const error = await response.json();
            alert(`Error claiming product: ${error.message}`);
        }
    } catch (error) {
        console.error('Error claiming product:', error);
        alert('Failed to claim product. Please try again later.');
    }
}

async function updateProductQuantity(productID) {
    const qtyElement = document.getElementById(`qty-${productID}`);
    const currentQty = parseInt(qtyElement.innerText);
    
    if (currentQty > 0) {
        qtyElement.innerText = currentQty - 1; // Decrease quantity
    } else {
        alert('No products available to claim.');
    }
}

function viewProduct(productID) {
    // Logic to view product details, could open a modal or redirect to a details page
    alert(`Viewing details for product ID: ${productID}`);
}

// Load products when the page loads
window.onload = loadProducts;
