# Candin — production build
# Multi-stage: Vite build → nginx static serve
FROM node:22-alpine AS builder

WORKDIR /app

# Bağımlılıkları önce kopyala (cache için)
COPY package.json package-lock.json* ./
RUN npm ci

# Kaynak kodu kopyala ve build et
COPY . .
RUN npm run build

# ---- Production: nginx ile statik serve ----
FROM nginx:1.27-alpine

# Build çıktısını nginx html dizinine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config (PB reverse proxy + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck: index.html'in varlığını kontrol et
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
