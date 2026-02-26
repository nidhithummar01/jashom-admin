# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# ---------- Runtime stage ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Security headers + SPA routing
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_tokens off;

    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

EXPOSE 8080
