const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // check if Bearer token is in the header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // pull out just the token part after "Bearer "
            token = req.headers.authorization.split(' ')[1];

            // throws an error automatically if token is expired or tampered
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // attach user to request so controllers can use it directly
            req.user = await User.findById(decoded.id).select('-password');

            next();

        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized, invalid token" 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Not authorized, no token provided" 
        });
    }
};

module.exports = { protect };