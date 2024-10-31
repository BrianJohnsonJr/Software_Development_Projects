const express = require('express');
const User = require('../models/users'); // Import User model
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
    try {
        // Retrieve the full user profile using the user ID from the token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        
        if (!user) {
            res.status(404);
            next(new Error('User not found'));
        }
        
        res.json({ message: 'Profile data', user });
    }
    catch (error) { next(error); }
});

module.exports = router;
