const express = require('express');
// const multer = require('multer');
const User = require('../models/users'); // Import the user model
const AuthService = require('../services/authService'); // Import AuthService
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads (profile picture now, post images later)
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Ensure the 'uploads' folder exists
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });
// const upload = multer({ storage: storage });

// Register route
router.post('/register', async (req, res, next) => {
    const { name, username, email, password, bio, imageUrl } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const message = existingUser.username === username ? 'Username already exists' : 'Email already exists';
            let err = new Error(message);
            err.status = 400;
            next(err);
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
    }
    catch (error) { next(error); }
});

// Login route
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await AuthService.verifyUsernameAndPassword(username, password);
        if (!user) {
            let err = new Error('Invalid username or password');
            err.status = 400;
            next(err);
        }

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
    }
    catch (error) { next(error); }
});

// Logout route
router.post('/logout', (req, res, next) => {
    try {
        res.clearCookie('token'); // Clear the token cookie
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) { next(error); }
});

router.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        // Retrieve the full user profile using the user ID from the token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        
        if (!user) {
            let err = new Error('User not found');
            err.status = 404
            next(err);
        }
        
        res.json({ message: 'Profile data', user });
    }
    catch (error) { next(error); }
});

module.exports = router;
