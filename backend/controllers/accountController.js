const User = require('../models/users'); // Import the user model
const { AuthService } = require('../services/authService'); // Import AuthService
const { uploadToCloud } = require('../services/fileService');
const { replaceProfilePicPath } = require('../services/fileService');

/**
 * Middleware to check if the user is authenticated and retrieve minimal user information.
 * The user is identified by the token passed in the request.
 */
exports.authCheck = async (req, res, next) => {
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
};

/**
 * Searches for users based on a search term, with optional pagination
 * The search term is applied to the username, name of users.
 */
exports.search = async (req, res, next) => {
    try {
        const searchParams = req.query.query?.trim() || '';
        const searchQuery = searchParams ? {
            $or: [
                { username: { $regex: searchParams, $options: 'i' }},
                { name: { $regex: searchParams, $options: 'i' }}
            ],
        }
        : {};

        const usersFound = await User.find(searchQuery).select('-password').sort({ _id: -1 }).limit(25);
        const totalFound = await User.countDocuments(searchQuery); // Count the amount of results

        res.json({ success: true, users: usersFound, resultCount: totalFound });
    }
    catch (err) { next(err); }
};

/**
 * Registers a new user by validating input, hashing the password, and saving the user to the database.
 */
exports.register = async (req, res, next) => {
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
};

/**
 * Authenticates a user by verifying their username and password, then generates a JWT token and sets it as a cookie.
 */
exports.loginUser = async (req, res, next) => {
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
};

/**
 * Logs the user out by clearing the authentication token cookie.
 */
exports.logout = (req, res, next) => {
    try {
        res.clearCookie('token'); // Clear the token cookie
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) { next(error); }
};

/**
 * Retrieves the authenticated user's profile information, including a signed URL for their profile picture.
 */
exports.viewProfile = async (req, res, next) => {
    try {
        // Retrieve the full user profile using the user ID from the token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        
        if (!user) {
            let err = new Error('User not found');
            err.status = 404
            return next(err);
        }
        
        await replaceProfilePicPath(req.s3, user);
        res.json({ success: true, user: user });
    }
    catch (error) { next(error); }
};

/**
 * Updates the authenticated user's profile picture by uploading a new file to S3.
 * The profile picture is updated only if a file is uploaded with the request.
 */
exports.updateProfile = async (req, res, next) => {
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
};

exports.getUserProfile = async (req, res, next) => {
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
};