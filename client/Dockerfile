# Base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY options-calc/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY options-calc/ .

# Expose the port your React app runs on
EXPOSE 3000

# Command to run the React app using nodemon
CMD ["npm", "start"]
