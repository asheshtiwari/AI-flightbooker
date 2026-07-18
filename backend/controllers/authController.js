const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET missing from env');
    }
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// dont send password to frontend
const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    walletBalance: user.walletBalance
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // all fields required
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // short passwords are easy to crack
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 6 characters" 
            });
        }

        // international format +countrycode+number
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: "Enter phone with country code eg +919140026925" 
            });
        }

        // check both so same email or phone cant register twice
        const existingUser = await User.findOne({ 
            $or: [{ email }, { phone }] 
        });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone already registered" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone
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

        // fields required before DB call
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        const user = await User.findOne({ email });

        // same message so attacker cant tell which field is wrong
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