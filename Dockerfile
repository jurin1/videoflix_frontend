# Dockerfile

# Stage 1: Build the Angular application
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration production

# Stage 2: Serve the Angular application with Nginx
FROM nginx:alpine
COPY --from=build-stage /app/dist/videoflix_frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]