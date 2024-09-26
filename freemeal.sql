-- Create Users table (stores donor and receiver info)
CREATE TABLE IF NOT EXISTS Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    role ENUM('donor', 'receiver') NOT NULL, -- Can only be either 'donor' or 'receiver'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table (stores food products donated by donors)
CREATE TABLE IF NOT EXISTS Products (
    productID INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(100) NOT NULL,
    metrics ENUM('kg', 'g', 'ml', 'm') NOT NULL, -- Metrics like kg, g, ml, or meters
    quantity DECIMAL(10,2) NOT NULL, -- Quantity with decimal support (e.g., 10.50 kg)
    expirationDate DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    donorID INT, -- Refers to the donor who uploaded the product
    FOREIGN KEY (donorID) REFERENCES Users(userID) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Claims table (stores info about the product claims by receivers)
CREATE TABLE IF NOT EXISTS Claims (
    claimID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT, -- Refers to the product being claimed
    receiverID INT, -- Refers to the receiver claiming the product
    claimDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- The date and time when the claim was made
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE,
    FOREIGN KEY (receiverID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- Create Notifications table (stores notifications sent to donors and receivers)
CREATE TABLE IF NOT EXISTS Notifications (
    notificationID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT, -- Refers to the product related to the notification
    donorID INT, -- Refers to the donor
    receiverID INT, -- Refers to the receiver
    message TEXT NOT NULL, -- Notification message
    notificationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE,
    FOREIGN KEY (donorID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (receiverID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- Create Admin table (optional for system administrators, if needed)
CREATE TABLE IF NOT EXISTS Admin (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
