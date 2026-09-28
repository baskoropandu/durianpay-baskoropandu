# Frontend build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
# Copy the OpenAPI spec so the typed client can be generated if needed.
COPY openapi.yaml ../openapi.yaml

RUN npm run build

# Runtime stage — serve the static build with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback + proxy API calls to the backend service.
# The backend hostname is injected via the BACKEND_HOST build arg (default: backend).
ARG BACKEND_HOST=backend
RUN printf 'server {\n  listen 80;\n  location /dashboard/v1/ {\n    proxy_pass http://%s;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location / {\n    root /usr/share/nginx/html;\n    try_files $uri /index.html;\n  }\n}\n' "$BACKEND_HOST" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]