# Base image for Node.js
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci
# Copy the rest of the app files
COPY . .

# Expose the default Metro Bundler port
EXPOSE 8081

# Start the Metro Bundler for React Native development
CMD ["npm", "start"]
