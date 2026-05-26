const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT token to enable seamless auto-login after registration
        const token = jwt.sign(
            { id: newUser._id }, 
            process.env.JWT_SECRET || 'fallback_dev_secret', 
            { expiresIn: '7d' }
        );

        // Exclude sensitive authentication data from response payload
        const userData = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            walletBalance: newUser.walletBalance
        };

        return res.status(201).json({ success: true, token, user: userData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Registration failed" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token for session management
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'fallback_dev_secret', 
            { expiresIn: '7d' }
        );

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            walletBalance: user.walletBalance
        };

        return res.status(200).json({ success: true, token, user: userData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Login failed" });
    }
};

module.exports = { registerUser, loginUser };