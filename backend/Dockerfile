# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files (optimizes image caching)
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy application code
COPY . .

# Expose server port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]