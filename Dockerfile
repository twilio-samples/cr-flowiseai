FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fresh install for production)
RUN npm ci

# Copy source code
COPY . .

# Build the app (e.g., compile TypeScript to JavaScript)
RUN npm run build

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
