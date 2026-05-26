const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and follows the Bearer token scheme
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token string from the header
            token = req.headers.authorization.split(' ')[1];

            // Verify and decode the JWT payload using the environment secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_dev_secret');

            // Retrieve the authenticated user from the database, excluding the sensitive password field
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };