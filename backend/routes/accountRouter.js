const express = require('express');
const { AuthorizeUser, VerifyParamsId } = require('../services/authService'); // Import AuthService
const { uploadToMemory, verifyS3 } = require('../services/fileService');
const controller = require('../controllers/accountController');

const router = express.Router();

// Route to check if the user is authenticated
router.get('/auth-check', AuthorizeUser, controller.authCheck);

/**
 * Queries users and returns users matching the specified query.
 * Does not allow for paging with lastId=<id>
 */
router.get('/search', async (req, res, next) => {
    try {
        const searchParams = req.query.query?.trim() || '';
        const searchQuery = searchParams ? {
            $or: [
                { username: { $regex: searchParams, $options: 'i' }},
                { name: { $regex: searchParams, $options: 'i' }},
                { bio: { $elemMatch: { $regex: searchParams, $options: 'i' }}}
            ],
        }
        : {};

        const usersFound = await User.find(searchQuery).select('-password').sort({ _id: -1 }).limit(25);
        const totalFound = await User.countDocuments(searchQuery); // Count the amount of results

        res.json({ success: true, users: usersFound, resultCount: totalFound });
    }
    catch (err) { next(err); }
});

// Register route
router.post('/register', uploadToMemory.none(), controller.register);

// Login route
router.post('/login', uploadToMemory.none(), controller.loginUser);

// Logout route
router.post('/logout', uploadToMemory.none(), controller.logout);

router.get('/profile', AuthorizeUser, controller.viewProfile);

// change profilePic if we have a different form fieldname
router.post('/profile', AuthorizeUser, uploadToMemory.single('profilePic'), controller.updateProfile);

router.get('/profile/:id', VerifyParamsId, verifyS3, controller.getUserProfile);

module.exports = router;
