# Use a lightweight official Node.js image
FROM node:20-slim

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server code
COPY server.js ./

# Set environment to production
ENV NODE_ENV=production

# Expose port (Cloud Run defaults to 8080, but can be overridden)
EXPOSE 8080

# Command to run the application
CMD [ "node", "server.js" ]
