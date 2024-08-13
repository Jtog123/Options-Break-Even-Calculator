# Base image
FROM node:18

# Set the working directory in container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the application
COPY . .

# Expose the port your app runs on (adjust if your server uses a different port)
EXPOSE 5000

# Command to run the app
CMD ["nodemon", "server.js"]