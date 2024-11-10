app.post('/products', upload.single('image'), async (req, res) => {
    const { productName, metrics, quantity, expirationDate, location } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;  // Path to store in database

    // Insert data into MySQL
    const query = 'INSERT INTO products (product_name, metrics, quantity, expiration_date, location, image_path) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [productName, metrics, quantity, expirationDate, location, imagePath];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error("Error inserting data:", error);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Product added successfully" });
    });
});
