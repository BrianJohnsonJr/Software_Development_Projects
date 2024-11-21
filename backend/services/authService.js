const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const TOKEN_SECRET = process.env.TOKEN_SECRET;

if (!TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET is not defined. Set it in your .env file.");
}

const AuthService = {

    /**
     * Verifies username and password, returns user if matched
     * @param {*} username 
     * @param {*} password 
     * @returns {object|null} The user object if authentication is successful, or null if failed.
     */
    async verifyUsernameAndPassword(username, password) {
        const user = await User.findOne({ username: username });
        if (!user) {
            console.log("User not found");
            return null;
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("Password does not match");
        }
        return passwordMatch ? user : null;
    },

    /**
     * Generates a JWT token for a user
     * @param {object} user 
     * @returns {string} The signed JWT token
     */
    generateToken(user) {
        return jwt.sign({ id: user._id, username: user.username }, TOKEN_SECRET, { expiresIn: '1h' });
    },

    /**
     * Verifies a JWT token and returns the decoded payload if valid
     * @param {string} token 
     * @returns {Promise<object>} The decoded token payLoad
     */
    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
                if (err) reject(err);
                resolve(decoded);
            });
        });
    },

    /**
     * Hashes a password using bcrypt
     * @param {string} password 
     * @returns {Promise<string>} The hashed password
     */
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

};

exports.AuthService = AuthService;

/**
 * Middleware function to verify incoming requests with a jwt cookie and provides a user id in req.user.id
 */
exports.AuthorizeUser = async (req, res, next) => {
    const token = req.cookies?.token; // Access token from cookie
    
    if (!token) {
        res.clearCookie('token'); // Clear old tokens
        return res.status(401).json({ message: "Access denied. Please log in." });
    }

    try {
        // Verify token and extract the user ID
        const decoded = await jwt.verify(token, TOKEN_SECRET);
        
        // Attach the user ID to req.user for database lookups
        req.user = { id: decoded.id };
        
        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error);
        
        // Clear invalid token cookies if token verification fails
        res.clearCookie('token');
        
        return res.status(403).json({ message: "Invalid or expired token. Please log in again." });
    }
};
