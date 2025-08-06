FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including private ones)
# This happens on YOUR machine with YOUR npm access
COPY node_modules ./node_modules

# Copy app code
COPY . .

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
