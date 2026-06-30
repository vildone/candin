# SIFIRDAN PocketBase imajı - superuser kontrolü bizde
FROM alpine:3.21

# PocketBase binary indir
ARG PB_VERSION=0.27.0
ARG TARGETARCH=amd64

RUN apk add --no-cache curl unzip sqlite ca-certificates

RUN curl -L -o /tmp/pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" \
    && unzip /tmp/pb.zip -d /pb/ \
    && chmod +x /pb/pocketbase \
    && rm /tmp/pb.zip

# Başlangıç scripti
COPY pb-init.sh /pb/init.sh
RUN chmod +x /pb/init.sh

# Migration dosyaları
COPY app/pb_migrations/ /pb/pb_migrations/

VOLUME /pb_data
EXPOSE 8090

ENTRYPOINT ["/pb/init.sh"]
