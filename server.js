const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors'); // To handle cross-origin requests
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'JAmie12!@', 
    resave: false,
    saveUninitialized: true,
}));

// Serve static files from the 'frontend/public' directory
app.use(express.static(path.join(__dirname, 'frontend/public')));


// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'freemeal',
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Middleware for checking authentication
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, 'JAmie12!@', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

//serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/html/index.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/html/register.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/html/login.html'));
});

app.get('/view-products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/html/view-products.html'));
});

app.get('/donor-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/html/donor-dashboard.html'));
});

// User registration
app.post('/register', (req, res) => {
    const { name, email, password, phoneNumber, location, role } = req.body;

    // Check if user already exists
    const checkUserSql = 'SELECT * FROM Users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking user', error: err });
        }

        if (results.length > 0) {
            return res.status(409).json({ redirect: '/login', message: 'This account already exists.' });
        }
        

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert new user into database
        const sql = 'INSERT INTO Users (name, email, password, phoneNumber, location, role) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [name, email, hashedPassword, phoneNumber, location, role], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error creating user', error: err });
            }
            res.status(201).json({ message: 'User created successfully', userID: result.insertId });
        });
    });
});


// User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const checkUserSql = 'SELECT * FROM Users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking user', error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // User exists, check the password
        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Password is valid; proceed with login
        // Include user role in the response
        res.status(200).json({
            message: 'Login successful',
            role: user.role // Send the user's role back to the frontend
        });
    });
});


// User logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});


//products
app.post('/products', authenticateJWT, (req, res) => {
    // Check user role
    if (req.user.role !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only donors can add products.' });
    }

    const { productName, metrics, quantity, expirationDate, location, image } = req.body;
    const sql = 'INSERT INTO Products (productName, metrics, quantity, expirationDate, location, image, donorID) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [productName, metrics, quantity, expirationDate, location, image, req.user.userID], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error adding product', error: err });
        }
        res.status(201).json({ message: 'Product added successfully', productID: result.insertId });
    });
});

// Get all products (for donors and receivers)
app.get('/products', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM Products';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching products', error: err });
        }
        res.json(results);
    });
});

// Claim a product (only for receivers)
app.post('/claim', authenticateJWT, (req, res) => {
    if (req.user.role !== 'receiver') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { productID } = req.body;
    const sql = 'INSERT INTO Claims (productID, receiverID) VALUES (?, ?)';

    db.query(sql, [productID, req.user.userID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error claiming product', error: err });
        }
        res.status(201).json({ message: 'Product claimed successfully', claimID: result.insertId });

        // Send notification to donor and receiver
        const notificationMessage = `Product with ID ${productID} has been claimed by receiver ${req.user.userID}.`;
        const notificationSQL = 'INSERT INTO Notifications (productID, donorID, receiverID, message) VALUES (?, ?, ?, ?)';

        db.query(notificationSQL, [productID, req.body.donorID, req.user.userID, notificationMessage], (err) => {
            if (err) {
                console.error('Error creating notification:', err);
            }
        });
    });
});

// Get claims history for donors
app.get('/claims/history', authenticateJWT, (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const sql = `
        SELECT c.*, p.productName, u.name AS receiverName
        FROM Claims c
        JOIN Products p ON c.productID = p.productID
        JOIN Users u ON c.receiverID = u.userID
        WHERE p.donorID = ?
    `;

    db.query(sql, [req.user.userID], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching claims history', error: err });
        }
        res.json(results);
    });
});

// Get all notifications for admin
app.get('/notifications', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const sql = 'SELECT * FROM Notifications ORDER BY notificationDate DESC';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching notifications', error: err });
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
