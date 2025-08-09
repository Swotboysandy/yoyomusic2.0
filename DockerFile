# Use Node.js 18 base image
FROM node:18-bullseye

# Install system dependencies needed for yt-dlp
RUN apt-get update && apt-get install -y yt-dlp ffmpeg

# Set working directory
WORKDIR /usr/src/app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Expose the port your app listens on
EXPOSE 5000

# Run the production server
CMD ["npm", "start"]
