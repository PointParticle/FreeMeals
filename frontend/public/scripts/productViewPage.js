async function loadProducts() {
    try {
        const response = await fetch('/products', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('Applesauce!@'),
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const products = await response.json();
        const productContainer = document.getElementById('product-container');

        productContainer.innerHTML = ''; // Clear existing products

        if (products.length === 0) {
            // Handle the case where no products are available
            productContainer.innerHTML = '<p>No products available at the moment.</p>';
        } else {
            // Display products
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image || 'path/to/default-image.jpg'}" alt="No picture available" class="product-image">
                    <h3>${product.productName}</h3>
                    <p>Quantity: <span id="qty-${product.productID}">${product.quantity}</span> ${product.metrics}</p>
                    <p>Expires on: ${new Date(product.expirationDate).toLocaleDateString()}</p>
                    <button class="btn" onclick="viewProduct(${product.productID})">View Details</button>
                    <button class="btn" onclick="claimProduct(${product.productID})">Claim Product</button>
                `;
                productContainer.appendChild(productCard);
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Failed to load products. Please try again later.');
    }
}

// Other functions remain unchanged...
