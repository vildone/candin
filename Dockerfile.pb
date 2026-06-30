# PocketBase + otomatik superuser oluşturma
FROM ghcr.io/muchobien/pocketbase:latest

# sqlite3 (superuser kontrolü için)
USER root
RUN apk add --no-cache sqlite curl
USER pb

# Başlangıç scripti
COPY --chown=pb:pb pb-init.sh /pb/pb-init.sh
RUN chmod +x /pb/pb-init.sh

# Migration dosyalarını kopyala
COPY app/pb_migrations/ /pb/pb_migrations/

EXPOSE 8090

# Kendi entrypoint'imiz
ENTRYPOINT ["/pb/pb-init.sh"]
