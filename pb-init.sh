#!/bin/sh
# PocketBase başlangıç scripti — superuser yoksa oluştur
# PB başlamadan önce çalışır

PB_DATA_DIR="/pb_data"
SUPERUSER_EMAIL="${PB_SUPERUSER_EMAIL:-ethemkoklu@gmail.com}"
SUPERUSER_PASSWORD="${PB_SUPERUSER_PASSWORD:-Ek**123719}"

# PocketBase binary'sini başlat (arka planda)
/pb/pocketbase serve --http=0.0.0.0:8090 --dir="$PB_DATA_DIR" &
PB_PID=$!

# PB'nin hazır olmasını bekle
sleep 3

# Superuser var mı kontrol et
ATTEMPT=0
MAX_ATTEMPTS=30
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/api/health 2>/dev/null)
  if [ "$RESPONSE" = "200" ]; then
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep 1
done

# Superuser oluşturmayı dene (ilk çalıştırmada)
# sqlite3 ile doğrudan ekle
if [ -f "$PB_DATA_DIR/data.db" ]; then
  EXISTING=$(sqlite3 "$PB_DATA_DIR/data.db" "SELECT COUNT(*) FROM _superusers;" 2>/dev/null)
  if [ "$EXISTING" = "0" ] || [ -z "$EXISTING" ]; then
    echo ">>> Creating superuser: $SUPERUSER_EMAIL"
    
    # PB'nin hash fonksiyonunu kullanmak için API'yi dene
    curl -s -X POST http://localhost:8090/api/admins \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$SUPERUSER_EMAIL\",\"password\":\"$SUPERUSER_PASSWORD\",\"passwordConfirm\":\"$SUPERUSER_PASSWORD\"}" \
      > /dev/null 2>&1
    
    echo ">>> Superuser creation attempted"
  else
    echo ">>> Superuser already exists ($EXISTING records)"
  fi
else
  echo ">>> PB data directory not ready yet, will retry..."
  # PB henüz db oluşturmadı, biraz daha bekle
  sleep 5
  # Tekrar dene
  curl -s -X POST http://localhost:8090/api/admins \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$SUPERUSER_EMAIL\",\"password\":\"$SUPERUSER_PASSWORD\",\"passwordConfirm\":\"$SUPERUSER_PASSWORD\"}" \
    > /dev/null 2>&1
fi

# Ana PB process'ini bekle
wait $PB_PID
