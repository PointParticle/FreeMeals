// server.js

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // You can change this port if needed

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key', // Change this to a more secure key in production
    resave: false,
    saveUninitialized: true,
}));

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // your password
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
        jwt.verify(token, 'your_jwt_secret', (err, user) => {
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

// Routes
// User registration
app.post('/register', (req, res) => {
    const { name, email, password, address, location, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO Users (name, email, password, address, location, role) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, address, location, role], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating user', error: err });
        }
        res.status(201).json({ message: 'User created successfully', userID: result.insertId });
    });
});

// User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = 'SELECT * FROM Users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ userID: user.userID, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
            req.session.userID = user.userID; // store user ID in session
            return res.json({ message: 'Login successful', token });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
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

// Add product (only for donors)
app.post('/products', authenticateJWT, (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { productName, metrics, quantity, expirationDate, location } = req.body;
    const sql = 'INSERT INTO Products (productName, metrics, quantity, expirationDate, location, donorID) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [productName, metrics, quantity, expirationDate, location, req.user.userID], (err, result) => {
        if (err) {
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

        // Optionally, create a notification
        const notificationMessage = `Product with ID ${productID} has been claimed by user ${req.user.userID}.`;
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
