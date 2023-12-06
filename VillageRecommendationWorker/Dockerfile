# Use a Node.js base image that includes TypeScript
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json, package-lock.json, and other necessary files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# set all args from .env
ARG SUPABASE_URL
ARG SUPABASE_SECRET
ARG LIKES_COUNT_RANKING_WEIGHT
ARG COMMENTS_COUNT_RANKING_WEIGHT
ARG RECENCY_RANKING_WEIGHT

# Install app dependencies
RUN npm install

# Compile TypeScript to JavaScript
RUN npm run build

# Your app's port, make sure it matches with your app's configuration
EXPOSE 3001

# Define the command to run your app using the compiled JavaScript files
CMD [ "node", "dist/index.js" ]
