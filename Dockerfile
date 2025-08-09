FROM node:20-bullseye

# Install system dependencies: ffmpeg, python3, python3-pip, and python (for compatibility)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python-is-python3

# Install yt-dlp using pip
RUN pip3 install yt-dlp

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
