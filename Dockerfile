# Use Node.js 18 base image with Debian Bullseye
FROM node:18-bullseye

# Install system dependencies: ffmpeg, python3, pip3
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# Install yt-dlp using pip
RUN pip3 install yt-dlp

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the project
RUN npm run build

# Expose the port your app listens on
EXPOSE 5000

# Start the production server
CMD ["npm", "start"]
