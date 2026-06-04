# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép package.json và package-lock.json từ thư mục frontend
COPY frontend/package*.json ./frontend/

# Cài đặt dependencies
RUN npm ci --prefix frontend

# Sao chép toàn bộ mã nguồn của frontend vào
COPY frontend/ ./frontend/

# Biên dịch frontend ra thư mục dist tĩnh
RUN npm run build --prefix frontend

# --- Stage 2: Production Stage ---
FROM nginx:alpine

# Tạo tệp cấu hình Nginx tối giản hỗ trợ SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Sao chép thư mục dist từ build stage sang thư mục static của Nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
