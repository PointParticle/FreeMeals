document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('product-container');
    const token = localStorage.getItem('token');

    try {
        // Fetch the products from the database
        const response = await fetch('/products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Add token to Authorization header
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();

        // Loop through the products and create a card for each one
        products.forEach(product => {
            createProductCard(product);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    // Function to create a product card
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // Image
        const img = document.createElement('img');
        img.src = product.image || '../uploads/noimage.PNG'; // Adjust based on actual field name
        img.alt = product.name;

        // Title
        const title = document.createElement('h3');
        title.textContent = product.name;

        // Description
        const description = document.createElement('p');
        description.textContent = `Quantity: ${product.quantity} ${product.metrics}`;

        const location = document.createElement('p');
        location.textContent = `Location: ${product.location}`;

        const expiration = document.createElement('p');
        const expirationDate = new Date(product.expirationDate);
        expiration.textContent = `Expires on: ${expirationDate.toISOString().split('T')[0]}`;
        

        // Button
        const button = document.createElement('button');
        button.textContent = 'Claim Now';

        // Append everything to the card
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(location);
        card.appendChild(expiration);
        card.appendChild(button);

        // Append the card to the container
        productContainer.appendChild(card);
    }
});
