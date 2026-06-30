#!/bin/sh
# PocketBase otomatik superuser script
# Hata durumunda durma — debug için

DATA_DIR="/pb_data"
EMAIL="${PB_SU...@gmail.com}"
PASSWORD="${PB_SUPERUSER_PASSWORD:-Ek**123719}"

echo ">>> PB Init starting..."
echo ">>> DATA_DIR=$DATA_DIR"
echo ">>> EMAIL=$EMAIL"

# PB binary'sini bul
if [ -f "/pb/pocketbase" ]; then
  PB_BIN="/pb/pocketbase"
elif [ -f "/usr/local/bin/pocketbase" ]; then
  PB_BIN="/usr/local/bin/pocketbase"
else
  PB_BIN=$(which pocketbase 2>/dev/null || echo "")
fi

if [ -z "$PB_BIN" ]; then
  echo ">>> ERROR: pocketbase binary not found!"
  ls -la /pb/ 2>/dev/null || true
  ls -la /usr/local/bin/ 2>/dev/null || true
  exit 1
fi

echo ">>> PB binary: $PB_BIN"

# PB'yi başlat
$PB_BIN serve --http=0.0.0.0:8090 --dir="$DATA_DIR" &
PB_PID=$!

# PB hazır olana kadar bekle (max 15 sn)
for i in $(seq 1 15); do
  if curl -s -o /dev/null http://localhost:8090/api/health 2>/dev/null; then
    echo ">>> PB is ready (${i}s)"
    break
  fi
  sleep 1
done

# Superuser kontrol et ve oluştur
echo ">>> Checking superuser..."
if [ -f "$DATA_DIR/data.db" ]; then
  COUNT=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
  echo ">>> Current superuser count: $COUNT"
  
  if [ "$COUNT" = "0" ]; then
    echo ">>> Creating superuser: $EMAIL"
    $PB_BIN superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1
    RET=$?
    echo ">>> Superuser create exit code: $RET"
  else
    echo ">>> Superuser already exists, skipping creation"
  fi
else
  echo ">>> DB not found at $DATA_DIR/data.db, waiting..."
  sleep 5
  if [ -f "$DATA_DIR/data.db" ]; then
    $PB_BIN superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1 || echo ">>> CLI failed, but continuing..."
  fi
fi

echo ">>> Init done. PB PID=$PB_PID"
wait $PB_PID
