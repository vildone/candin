# PocketBase + migrations image
FROM ghcr.io/muchobien/pocketbase:latest

# Migration dosyalarını kopyala
COPY app/pb_migrations/ /pb/pb_migrations/

EXPOSE 8090
