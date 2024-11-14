const express = require('express');
// const multer = require('multer');
const User = require('../models/users'); // Import the user model
const { AuthService, AuthorizeUser } = require('../services/authService'); // Import AuthService
const { uploadToMemory, uploadToCloud } = require('../services/uploadService');
const router = express.Router();

// Register route
router.post('/register', uploadToMemory.none(), async (req, res, next) => {
    const { name, username, email, password, bio, imageUrl } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const message = existingUser.username === username ? 'Username already exists' : 'Email already exists';
            let err = new Error(message);
            err.status = 400;
            return next(err);
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
router.post('/login', uploadToMemory.none(), async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await AuthService.verifyUsernameAndPassword(username, password);
        if (!user) {
            let err = new Error('Invalid username or password');
            err.status = 400;
            return next(err);
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
router.post('/logout', uploadToMemory.none(), (req, res, next) => {
    try {
        res.clearCookie('token'); // Clear the token cookie
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) { next(error); }
});

router.get('/profile', AuthorizeUser, async (req, res, next) => {
    try {
        // Retrieve the full user profile using the user ID from the token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        
        if (!user) {
            let err = new Error('User not found');
            err.status = 404
            return next(err);
        }
        
        res.json({ message: 'Profile data', user });
    }
    catch (error) { next(error); }
});

// change profilePic if we have a different form fieldname
router.post('/profile', AuthorizeUser, uploadToMemory.single('profilePic'), async (req, res, next) => {
    try {
        if(!req.file) {
            let err = new Error('No file uploaded');
            err.status = 400;
            return next(err);
        }

        const user = await User.findById(req.user.id).select('-password');
        const file = await uploadToCloud(req.s3, req.file);

        user.profilePicture = file.filename;

        await user.save();

        res.json({ success: true, message: 'Profile picture updated successfully' });
    }
    catch (error) { next(error); }
});

module.exports = router;
