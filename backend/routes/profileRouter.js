const express = require('express');
const { User } = require('../models/users'); // Import User model
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // Retrieve the full user profile using the user ID from the token
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'Profile data', user });
    } catch (error) {
        console.error('Error retrieving profile data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
