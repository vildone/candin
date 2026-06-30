#!/bin/sh
# PocketBase init - superuser oluştur
DATA_DIR="/pb_data"
PB_BIN="/pb/pocketbase"
EMAIL="${PB_SUPERUSER_EMAIL:-ethemkoklu@gmail.com}"
PASSWORD=*** Miraç PB Init ==="
echo "EMAIL=$EMAIL"

# Migration'ları kopyala
if [ -d "/pb/pb_migrations" ]; then
  mkdir -p "$DATA_DIR/pb_migrations"
  cp -r /pb/pb_migrations/* "$DATA_DIR/pb_migrations/" 2>/dev/null || true
  echo "Migrations copied"
fi

# PB başlat
echo "Starting PB..."
$PB_BIN serve --http=0.0.0.0:8090 --dir="$DATA_DIR" 2>&1 &
PB_PID=$!

# Hazır olmasını bekle
for i in $(seq 1 30); do
  if curl -sf http://localhost:8090/api/health > /dev/null 2>&1; then
    echo "PB ready (${i}s)"
    break
  fi
  sleep 1
done

# Superuser oluştur
sleep 3
if [ -f "$DATA_DIR/data.db" ]; then
  # Önce SQLite ile kontrol et
  COUNT=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
  echo "Superuser count: $COUNT"
  
  if [ "$COUNT" = "0" ]; then
    echo "Creating superuser..."
    
    # Yöntem 1: CLI (v0.22+)
    $PB_BIN superuser create "$EMAIL" "$PASSWORD" --dir="$DATA_DIR" 2>&1 || true
    
    # Tekrar kontrol et
    sleep 1
    COUNT2=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
    
    if [ "$COUNT2" = "0" ]; then
      # Yöntem 2: API (localhost'ta çalışabilir)
      echo "CLI failed, trying API..."
      curl -s -X POST http://localhost:8090/api/admins \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"passwordConfirm\":\"$PASSWORD\"}" 2>&1 || true
      
      # Yöntem 3: direk SQLite insert (bcrypt hash gerekir, son çare)
      sleep 1
      COUNT3=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
      if [ "$COUNT3" = "0" ]; then
        echo "All methods failed! Check PB version compatibility."
        # Debug: PB version
        $PB_BIN --version 2>&1 || true
        $PB_BIN help 2>&1 | head -20 || true
      fi
    fi
    
    FINAL=$(sqlite3 "$DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null || echo "0")
    echo "Final superuser count: $FINAL"
  fi
fi

echo "=== Init done, waiting for PB ==="
wait $PB_PID
