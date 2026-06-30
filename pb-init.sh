#!/bin/sh
set -e

DATA_DIR="/pb_data"
MIGRATIONS_DIR="/pb/pb_migrations"
PB_BIN="/pb/pocketbase"

EMAIL="${PB_SUPERUSER_EMAIL:-ethemkoklu@gmail.com}"
PASSWORD="${PB...echo "=== Miraç PB Init ==="
echo "DATA_DIR=$DATA_DIR"

# Migration'ları kopyala (ilk çalıştırma için)
if [ -d "$MIGRATIONS_DIR" ] && [ -n "$(ls -A $MIGRATIONS_DIR 2>/dev/null)" ]; then
  mkdir -p "$DATA_DIR/pb_migrations"
  cp -r "$MIGRATIONS_DIR"/* "$DATA_DIR/pb_migrations/" 2>/dev/null || true
  echo "Migrations copied"
fi

# PB'yi başlat (arka planda, logları göster)
echo "Starting PocketBase..."
$PB_BIN serve --http=0.0.0.0:8090 --dir="$DATA_DIR" &
PB_PID=$!
echo "PB PID=$PB_PID"

# PB'nin hazır olmasını bekle (max 30sn)
echo "Waiting for PB..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8090/api/health > /dev/null 2>&1; then
    echo "PB ready after ${i}s"
    break
  fi
  sleep 1
done

# Superuser kontrolü ve oluşturma
sleep 2  # DB'nin tam olarak oluşması için
if [ -f "$DATA_DIR/data.db" ]; then
  COUNT=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
  echo "Existing superusers: $COUNT"
  
  if [ "$COUNT" = "0" ]; then
    echo ">>> Creating superuser: $EMAIL"
    $PB_BIN superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1
    echo ">>> Superuser created"
  else
    echo ">>> Superuser already exists, skipping"
  fi
else
  echo ">>> DB not found, waiting..."
  sleep 5
  if [ -f "$DATA_DIR/data.db" ]; then
    $PB_BIN superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1 || echo ">>> CLI failed - continuing anyway"
  fi
fi

echo "=== Init complete, waiting for PB ==="
wait $PB_PID
