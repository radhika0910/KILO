FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Expo dev server ports
EXPOSE 8081 19000 19001

# Start Expo development server with web support
CMD ["npm", "start", "--", "--web"]
