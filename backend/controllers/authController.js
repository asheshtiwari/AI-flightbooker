const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate a signed JWT token for the given user ID
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is missing from environment variables');
    }
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Strip out password and internal fields before sending user data to frontend
const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    walletBalance: user.walletBalance
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic field presence check before touching the database
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, email and password are all required" 
            });
        }

        // Minimum password length — short passwords are easy to brute force
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 6 characters" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "This email is already registered" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = generateToken(newUser._id);

        return res.status(201).json({ 
            success: true, 
            token, 
            user: sanitizeUser(newUser) 
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Registration failed. Please try again." 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Field check before database lookup
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        const user = await User.findOne({ email });

        // Same message for wrong email and wrong password
        // Separate messages let attackers figure out which emails are registered
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({ 
            success: true, 
            token, 
            user: sanitizeUser(user) 
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Login failed. Please try again." 
        });
    }
};

module.exports = { registerUser, loginUser };