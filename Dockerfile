# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install server dependencies
RUN npm ci --only=production

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Copy all source code
WORKDIR /app
COPY . .

# Build the React app
WORKDIR /app/client
RUN npm run build

# Set working directory back to app root
WORKDIR /app

# Expose port
EXPOSE 3002

# Start the application
CMD ["npm", "start"] 