const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Initialize Express
let app = express();
const port = 3001;

// Create upload directory if not exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'Applesauce!@', // Hardcoded session secret
    resave: false,
    saveUninitialized: true,
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend/public')));
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
        process.exit(1); // Exit if database connection fails
    }
    console.log('Connected to database.');
});

// Multer storage configuration for image uploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
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

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token part after "Bearer"

    if (token) {
        jwt.verify(token, 'Applesauce!@', (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Access denied, invalid token.' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'Access denied, token missing.' });
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

// User Registration
app.post('/register', (req, res) => {
    const { name, email, password, phoneNumber, location, role } = req.body;
    const checkUserSql = 'SELECT * FROM Users WHERE email = ?';

    db.query(checkUserSql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking user', error: err });
        if (results.length > 0) return res.status(409).json({ redirect: '/login', message: 'This account already exists.' });

        const hashedPassword = bcrypt.hashSync(password, 10);
        const sql = 'INSERT INTO Users (name, email, password, phoneNumber, location, role) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(sql, [name, email, hashedPassword, phoneNumber, location, role], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error creating user', error: err });
            res.status(201).json({ message: 'User created successfully', userID: result.insertId });
        });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const checkUserSql = 'SELECT * FROM Users WHERE email = ?';

    db.query(checkUserSql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking user', error: err });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ userID: user.userID, role: user.role }, 'Applesauce!@', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token, role: user.role });
    });
});

// Product Creation with Image Upload
app.post('/products', authenticateJWT, upload.single('image'), (req, res) => {
    if (req.user.role !== 'donor') {
        return res.status(403).json({ message: 'Access denied. Only donors can add products.' });
    }

    const { productName, metrics, quantity, expirationDate, location } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = 'INSERT INTO Products (productName, metrics, quantity, expirationDate, location, image, donorID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [productName, metrics, quantity, expirationDate, location, imagePath, req.user.userID], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding product', error: err });
        res.status(201).json({ message: 'Product added successfully', productID: result.insertId });
    });
});

// Fetch Products
app.get('/products', authenticateJWT, (req, res) => {
    const sql = 'SELECT * FROM Products';

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching products', error: err });

        const updatedResults = results.map(product => {
            if (product.image) product.image = `${req.protocol}://${req.get('host')}${product.image}`;
            return product;
        });
        
        res.json(updatedResults);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
