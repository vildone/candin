#!/bin/sh
# PocketBase otomatik superuser script
set -e

DATA_DIR="/pb_data"
EMAIL="${PB_SUPERUSER_EMAIL:-ethemkoklu@gmail.com}"
PASSWORD="${PB...n

echo ">>> PB Init: checking superuser..."

# PB'yi başlat
/pb/pocketbase serve --http=0.0.0.0:8090 --dir="$DATA_DIR" &
PB_PID=$!

# PB hazır olana kadar bekle
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/api/health 2>/dev/null | grep -q 200; then
    echo ">>> PB is ready"
    break
  fi
  sleep 1
done

# Superuser oluşturmayı dene - CLI ile
/pb/pocketbase superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1 || true

# Alternatif: SQLite ile kontrol et ve ekle
if [ -f "$DATA_DIR/data.db" ]; then
  COUNT=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
  echo ">>> Superuser count: $COUNT"
  if [ "$COUNT" = "0" ]; then
    echo ">>> Creating superuser via CLI..."
    /pb/pocketbase superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" || echo ">>> CLI failed, trying API..."
    # Eğer CLI çalışmazsa API'yi dene
    curl -s -X POST http://localhost:8090/api/collections/_superusers/records \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"passwordConfirm\":\"$PASSWORD\"}" 2>/dev/null || true
  fi
else
  echo ">>> DB not ready, waiting..."
  sleep 3
  /pb/pocketbase superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1 || true
fi

echo ">>> Init complete, waiting for PB process..."
wait $PB_PID
