-- Create the database
CREATE DATABASE IF NOT EXISTS freemeal;
USE freemeal;

-- Create Roles table (stores different roles like donor, receiver, admin)
CREATE TABLE IF NOT EXISTS Roles (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(50) UNIQUE NOT NULL -- Unique role name (e.g., 'donor', 'receiver', 'admin')
);

-- Pre-populate the Roles table with default roles
INSERT INTO Roles (roleName) VALUES ('donor'), ('receiver'), ('admin');

-- Create Users table (stores donor, receiver, and admin info)
CREATE TABLE IF NOT EXISTS Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Ensure this is long enough for hashed passwords (e.g., bcrypt)
    address VARCHAR(255),
    location VARCHAR(255),
    roleID INT, -- Refers to the role of the user
    FOREIGN KEY (roleID) REFERENCES Roles(roleID) ON DELETE SET NULL, -- Role reference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    role ENUM('donor', 'receiver', 'admin') NOT NULL DEFAULT 'donor';
);



-- Create Products table (stores food products donated by donors)
CREATE TABLE IF NOT EXISTS Products (
    productID INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(100) NOT NULL,
    metrics ENUM('kg', 'g', 'ml', 'm') NOT NULL, -- Metrics like kg, g, ml, or meters
    quantity DECIMAL(10,2) NOT NULL, -- Quantity with decimal support (e.g., 10.50 kg)
    expirationDate DATE NOT NULL,
    location VARCHAR(100) NOT NULL, -- Location of the product (if different from the donor's location)
    donorID INT NOT NULL, -- Refers to the donor who uploaded the product
    FOREIGN KEY (donorID) REFERENCES Users(userID) ON DELETE CASCADE, -- Cascading deletion if donor is removed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Claims table (stores info about product claims by receivers)
CREATE TABLE IF NOT EXISTS Claims (
    claimID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT NOT NULL, -- Refers to the product being claimed
    receiverID INT NOT NULL, -- Refers to the receiver claiming the product
    claimDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- The date and time when the claim was made
    status ENUM('pending', 'approved', 'fulfilled') DEFAULT 'pending', -- Optional status to track the claim process
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE, -- Cascade delete product claims if product is removed
    FOREIGN KEY (receiverID) REFERENCES Users(userID) ON DELETE CASCADE -- Cascade delete claims if receiver is removed
);

-- Create Notifications table (stores notifications sent to donors and receivers)
CREATE TABLE IF NOT EXISTS Notifications (
    notificationID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT NOT NULL, -- Refers to the product related to the notification
    donorID INT NOT NULL, -- Refers to the donor
    receiverID INT NOT NULL, -- Refers to the receiver
    message TEXT NOT NULL, -- Notification message content
    isRead BOOLEAN DEFAULT FALSE, -- Optionally track if notification was read
    notificationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE, -- Cascade delete notifications if product is removed
    FOREIGN KEY (donorID) REFERENCES Users(userID) ON DELETE CASCADE, -- Cascade delete if donor is removed
    FOREIGN KEY (receiverID) REFERENCES Users(userID) ON DELETE CASCADE -- Cascade delete if receiver is removed
);

-- Admin table (optional, not necessary if you manage admins via the Roles table)
-- Create Admin table (optional for system administrators, if needed)
CREATE TABLE IF NOT EXISTS Admin (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
