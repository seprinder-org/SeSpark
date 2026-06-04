# --- Stage 1: Build Rust WASM ---
FROM rust:1.80-slim AS rust-builder

WORKDIR /app

# Cài đặt curl và wasm-pack
RUN apt-get update && apt-get install -y curl && \
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Sao chép slicer-engine
COPY slicer-engine ./slicer-engine

# Build slicer-engine ra thư mục build-output của WASM
WORKDIR /app/slicer-engine
RUN wasm-pack build --target web --out-dir /app/frontend/src/lib/wasm-engine

# --- Stage 2: Build Node Frontend ---
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép package.json và package-lock.json từ thư mục frontend
COPY frontend/package*.json ./frontend/

# Cài đặt dependencies
RUN npm ci --prefix frontend

# Sao chép toàn bộ mã nguồn của frontend vào
COPY frontend/ ./frontend/

# Sao chép WASM build output từ rust-builder stage sang frontend
COPY --from=rust-builder /app/frontend/src/lib/wasm-engine ./frontend/src/lib/wasm-engine

# Biên dịch frontend ra thư mục dist tĩnh
RUN npm run build --prefix frontend

# --- Stage 3: Production Stage ---
FROM nginx:alpine

# Tạo tệp cấu hình Nginx tối giản hỗ trợ SPA routing lắng nghe ở cổng 5173
RUN echo 'server { \
    listen 5173; \
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

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
