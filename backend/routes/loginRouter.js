const express = require('express');
const multer = require('multer');
const { User } = require('../models/userInfo'); // Import the user model
const AuthService = require('../services/authService'); // Import AuthService
const router = express.Router();

// Configure multer for file uploads (profile picture now, post images later)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure the 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Register route
router.post('/register', async (req, res, next) => {
    const { name, username, email, password, bio, imageUrl } = req.body;

    try {
        if (!name || !username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields: name, username, email, password.' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const message = existingUser.username === username ? 'Username already exists' : 'Email already exists';
            return res.status(400).json({ success: false, message });
        }

        const hashedPassword = await AuthService.hashPassword(password);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            bio,
            profilePicture: imageUrl || '' // Ensure a default empty string if imageUrl is missing
        });

        await newUser.save();
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await AuthService.verifyUsernameAndPassword(username, password);
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        // Generate token
        const token = AuthService.generateToken(user);

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Send cookie over HTTPS only in production
            sameSite: 'strict',
            maxAge: 3600000, // 1 hour in milliseconds
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error during login:', error); // Log error
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
