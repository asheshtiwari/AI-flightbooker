const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // no point running server without DB
        logger.error(`DB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;