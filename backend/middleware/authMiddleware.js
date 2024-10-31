const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // Access token from cookie
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
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
        
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
