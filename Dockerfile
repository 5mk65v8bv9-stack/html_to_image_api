# Use Node with Puppeteer dependencies pre-installed
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use install instead of ci)
RUN npm install --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Start the server
CMD ["npm", "start"]
