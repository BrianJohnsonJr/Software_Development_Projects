const express = require('express');
const { AuthorizeUser } = require('../services/authService'); // Import AuthService
const { VerifyParamsId, VerifyLastId, VerifyS3, SanitizeSearch, ValidateResult } = require('../services/verifyService');
const { uploadToMemory } = require('../services/fileService');
const controller = require('../controllers/accountController');

const router = express.Router();

// Route to check if the user is authenticated
router.get('/auth-check', AuthorizeUser, controller.authCheck);

/**
 * Queries users and returns users matching the specified query.
 * Does not allow for paging with lastId=<id>
 */
router.get('/search', VerifyLastId, SanitizeSearch, ValidateResult, controller.search);

// Register route
router.post('/register', uploadToMemory.none(), controller.register);

// Login route
router.post('/login', uploadToMemory.none(), controller.loginUser);

// Logout route
router.post('/logout', uploadToMemory.none(), controller.logout);

router.get('/profile', AuthorizeUser, controller.viewProfile);

// change profilePic if we have a different form fieldname
router.post('/profile', AuthorizeUser, uploadToMemory.single('profilePic'), controller.updateProfile);

router.get('/profile/:id', VerifyParamsId, VerifyS3, controller.getUserProfile);

module.exports = router;
