# Vite + React geliştirme sunucusu için imaj.
# Üretim için bu dosyanın altına ek bir "production" stage eklenebilir.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 8765

# Vite dev sunucusunu konteyner dışından erişilebilir kıl
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8765"]
