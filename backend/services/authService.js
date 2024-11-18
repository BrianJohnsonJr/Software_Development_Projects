const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const TOKEN_SECRET = process.env.TOKEN_SECRET;

const AuthService = {

    /**
     * Verifies username and password, returns user if matched
     * @param {*} username 
     * @param {*} password 
     * @returns 
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
     * @param {*} user 
     * @returns 
     */
    generateToken(user) {
        return jwt.sign({ id: user._id, username: user.username }, TOKEN_SECRET, { expiresIn: '1h' });
    },

    /**
     * Verifies a JWT token and returns the decoded payload if valid
     * @param {*} token 
     * @returns 
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
     * @param {*} password 
     * @returns 
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
    const token = req.cookies.token; // Access token from cookie
    
    if (!token) {
        let err = new Error("Access denied. No token provided");
        err.status = 401;
        return next(err);
    }

    try {
        // Verify token and extract the user ID
        const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
        
        // Attach the user ID to req.user for database lookups
        req.user = { id: decoded.id };
        
        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error);
        
        // Clear invalid token cookies if token verification fails
        res.clearCookie('token');
        
        let err = new Error("Invalid or expired token");
        err.status = 403;
        next(err);
    }
};

function validateId(id) {
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid id: ' + id);
        err.status = 400;
        return err;
    } else {
        return null;
    }
}

/**
 * Middleware function to verify passed lastId is correctly formatted
 */
exports.VerifyLastId = (req, res, next) => {
    console.log("in lasid ver");
    try {
        // Grab the ?lastId=, if doesn't exist, null.
        let id = req.query.lastId || null;
        if(!id) return next(); // If no id, no error needed.

        const err = validateId(id);
        if(err) {
            return next(err);
        } else {
            return next();
        }
    }
    catch (err) { next(err); }
};

/**
 * Middleware function to verify parameter id is correctly formatted
 */
exports.VerifyParamsId = (req, res, next) => {
    console.log("in poaram  ver");
    try {
        // Grab the /:id
        let id = req.params.id;

        const err = validateId(id);
        if(err) {
            return next(err);
        } else {
            return next();
        }
    }
    catch (err) { next(err); }
}
