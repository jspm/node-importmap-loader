FROM node:24-alpine

WORKDIR /app

# Copy only package.json first for better caching
COPY package.json ./

# Install only the importmap loader
RUN npm install

# Copy the rest of the application
COPY . .

# Generate importmap using jspm
RUN npm run setup

# Run the Prettier demo
CMD ["npm", "run", "format"]
