const express = require('express');
const { AuthorizeUser, VerifyParamsId } = require('../services/authService'); // Import AuthService
const { uploadToMemory, verifyS3 } = require('../services/fileService');
const controller = require('../controllers/accountController');

const router = express.Router();

// Route to check if the user is authenticated
router.get('/auth-check', AuthorizeUser, controller.authCheck);

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
