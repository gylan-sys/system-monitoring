# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code and config files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy custom nginx configuration for PWA & SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
