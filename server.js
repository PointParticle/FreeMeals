const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors'); // To handle cross-origin requests
const path = require('path');
const multer = require('multer'); // To handle file uploads
const fs = require('fs');

const app = express();
const port = 3000;

// Create the uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

// Serve static files from the 'uploads' directory for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Directory to store images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    }
});
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'));
        }
    }
});

// Middleware for checking authentication
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, 'JAmie12!@', (err, user) => {
            if (err) {
                return res.sendStatus(403); // Token is invalid or expired
            }
            req.user = user; // Attach user data to the request
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized if no token is provided
    }
};

// Serve pages
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

    const checkUserSql = 'SELECT * FROM Users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking user', error: err });
        }

        if (results.length > 0) {
            return res.status(409).json({ redirect: '/login', message: 'This account already exists.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

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

    const checkUserSql = 'SELECT * FROM Users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking user', error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userID: user.userID, role: user.role }, 'JAmie12!@', { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role
        });
    });
});

// Product Creation (with Image Upload)
app.post('/products', authenticateJWT, upload.single('image'), (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only donors can add products.' });
    }

    const { productName, metrics, quantity, expirationDate, location } = req.body;
    const image = req.file ? req.file.path : null;

    const sql = 'INSERT INTO Products (productName, metrics, quantity, expirationDate, location, image, donorID) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [productName, metrics, quantity, expirationDate, location, image, req.user.userID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding product', error: err });
        }
        res.status(201).json({ message: 'Product added successfully', productID: result.insertId });
    });
});

// Fetch Products
app.get('/products', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM Products';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching products', error: err });
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
