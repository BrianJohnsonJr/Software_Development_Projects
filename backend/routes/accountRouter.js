const express = require('express');
// const multer = require('multer');
const User = require('../models/users'); // Import the user model
const { AuthService, AuthorizeUser, VerifyParamsId } = require('../services/authService'); // Import AuthService
const { uploadToMemory, uploadToCloud, verifyS3, replaceProfilePicPath } = require('../services/fileService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const router = express.Router();

// Route to check if the user is authenticated
router.get('/auth-check', AuthorizeUser, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('username email'); // Fetch minimal user info
        if (!user) {
            let err = new Error('User not found');
            err.status = 404;
            return next(err);
        }

        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
});

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

router.get('/profile', AuthorizeUser, verifyS3, async (req, res, next) => {
    try {
        // Retrieve the full user profile using the user ID from the token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        
        if (!user) {
            let err = new Error('User not found');
            err.status = 404
            return next(err);
        }

        const imageKey = user.profilePicture || 'default_image.png';
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey,
        });
        const signedUrl = await getSignedUrl(req.s3, command, { expiresIn: 60 });

        user.profilePicture = signedUrl;
        
        res.json({ success: true, user: user });
    }
    catch (error) { next(error); }
});

// change profilePic if we have a different form fieldname
router.post('/profile', AuthorizeUser, verifyS3, uploadToMemory.single('profilePic'), async (req, res, next) => {
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

router.get('/profile/:id', VerifyParamsId, verifyS3, async (req, res, next) => {
    // This route must be last so it doesnt catch other routes
    try {
        let id = req.params.id;

        const profile = await User.findById(id).select('-password');
        if(!profile) {
            let err = new Error('User not found');
            err.status = 404;
            return next(err);
        }

        await replaceProfilePicPath(req.s3, profile);
        res.json({ success: true, user: profile });
    }
    catch (err) { next(err); }
});

module.exports = router;
