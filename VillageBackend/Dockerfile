# Use a Node.js base image that includes TypeScript
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json, package-lock.json, and other necessary files
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# set all args from .env
ARG DATABASE_URL
ARG DIRECT_URL
ARG TWILIO_ACCOUNT_SID
ARG TWILIO_AUTH_TOKEN
ARG TWILIO_PHONE_NUMBER
ARG JWT_SECRET
ARG STREAM_CHAT_API_SECRET
ARG STREAM_CHAT_API_KEY

# Install app dependencies
RUN npm install

# Compile TypeScript to JavaScript
RUN npm run build

# Generate Prisma Client
RUN npm run prisma:generate

# Your app's port, make sure it matches with your app's configuration
EXPOSE 3000

# Define the command to run your app using the compiled JavaScript files
CMD [ "node", "dist/index.js" ]
