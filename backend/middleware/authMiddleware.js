const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // Access token from cookie
    
    if (!token) {
        let err = new Error("Access denied. No token provided");
        err.status = 401;
        next(err);
    }

    try {
        // Verify token and extract the user ID
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        
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

module.exports = authMiddleware;
