# Base image for Node.js
FROM node:18-bullseye

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the app files
COPY . .

# Expose the default Metro Bundler port
EXPOSE 8081

# Start the Metro Bundler for React Native development
CMD ["yarn", "start"]
