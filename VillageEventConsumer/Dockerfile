# Use a Node.js base image that includes TypeScript
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json, package-lock.json, and other necessary files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# set all args from .env
ARG RABBITMQ_PRIVATE_URL
ARG OPENAI_API_KEY
ARG SUPABASE_URL
ARG SUPABASE_SECRET
ARG FIREBASE_SERVICE_ACCOUNT_BASE64

# Install app dependencies
RUN npm install

# Compile TypeScript to JavaScript
RUN npm run build

# Define the command to run your app using the compiled JavaScript files
CMD ["sh", "-c", "sleep 5 && node dist/index.js"]
