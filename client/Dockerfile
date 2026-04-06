# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the app with production environment
RUN npm run build

# Production stage (using Nginx)
FROM nginx:stable-alpine as production-stage

# Copy the build artifacts from build-stage to nginx public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Replace default nginx config to handle SPA routing (Single Page App)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
    location /api/v1 { \
        proxy_pass http://backend:5000; \
        proxy_set_header Host \$host; \
        proxy_set_header X-Real-IP \$remote_addr; \
    } \
    location /uploads { \
        proxy_pass http://backend:5000; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
