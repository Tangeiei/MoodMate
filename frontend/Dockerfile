# Stage 1: Build Angular App
FROM node:24-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build for production
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built browser bundle from Stage 1
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
