# Candin — production build (nginx static serve)
# app/ alt dizinindeki Vite projesini build edip nginx ile serve eder.
# Root'ta package.json yok → CasaOS image: direktifine saygı duyar.
FROM node:22-alpine AS builder

WORKDIR /build

# Bağımlılıkları önce kopyala (cache için)
COPY app/package.json app/package-lock.json* ./
RUN npm ci

# Kaynak kodu kopyala ve build et
COPY app/ .
RUN npm run build

# ---- Production: nginx ile statik serve ----
FROM nginx:1.27-alpine

# Build çıktısını nginx html dizinine kopyala
COPY --from=builder /build/dist /usr/share/nginx/html

# nginx config (PB reverse proxy + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
