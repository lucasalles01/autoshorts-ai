FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm install -g typescript tsx
RUN npx tsc

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/server.js"]
