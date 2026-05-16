# Candin — Oturum Devri (Handoff)

**Son güncelleme:** 2026-05-16
**Durum:** Tüm içerik ve ilerleme PB'ye taşındı. Zustand + dataFetcher kaldırıldı.

---

## Çalışan Stack

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"
colima start      # gerekirse
docker compose up -d
```

- **Web (Vite + React):** http://localhost:8765
- **PocketBase API:** http://localhost:8090
- **PocketBase Admin UI:** http://localhost:8090/_/

### Superuser
- E-posta: `ethemkoklu@gmail.com`
- Şifre: `Ek**123719`
- Şifreyi unutursan/sıfırlamak istersen:
  ```bash
  docker exec candin-pb /usr/local/bin/pocketbase --dir /pb_data superuser upsert <email> <pass>
  ```

---

## Önemli Gotcha'lar (Bir Daha Tuzağa Düşme)

### 1. Colima mount path
Proje `/Volumes/King/...` altında. Colima varsayılan olarak `/Volumes`'u mount **etmez**. Çözüldü:
- `/Volumes/King/Vibe/Colima/default/colima.yaml` içine eklendi:
  ```yaml
  mounts:
    - location: /Volumes/King
      writable: true
  ```
- Yeni Colima VM'i başlattığında bu ayar korunmalı; aksi halde container `package.json` bulamaz (ENOENT).

### 2. PocketBase CLI `--dir` flag'i ZORUNLU
`docker exec candin-pb pocketbase superuser upsert ...` çalıştırırken **mutlaka** `--dir /pb_data` ver. Aksi halde CLI varsayılan olarak `/usr/local/bin/pb_data` dizinine yazar, server `/pb_data` dizinini kullanır → şifre uyuşmaz, "Invalid login credentials" hatası alırsın.

### 3. PocketBase v0.38 API
- Eski API (`Dao`, `SchemaField`, `dao.saveCollection`) **kaldırıldı**.
- Yeni API: `app.findCollectionByNameOrId()`, `new NumberField/TextField/JSONField(...)`, `collection.fields.add(...)`, `app.save(collection)`.
- Çalışan örnek: `pb_migrations/1715000000_extend_users.js`.

### 4. Vite, Next.js değil
Kullanıcı zaman zaman "Next.js" diyor ama proje **Vite 7 + React 19 + React Router 7**. `app/` veya `pages/` Next router'ı varsaymak yanlış. Rotalar `src/App.tsx` içinde `<Routes>`.

### 5. Türkçe dosya yolu
Proje yolu `/Volumes/King/Vibe/Canım Dinim/Candin` — Türkçe karakter içeriyor. Şu an sorun yok ama yeni script eklerken path'i hep tırnak içine al.

---

## Kullanıcının KESİN Kuralları (Asla Atlama)

- **Türkçe:** UI metinleri, butonlar, kullanıcıya görünen her şey **kesinlikle** Türkçe.
- **Yasaklı isimlendirme:** "god-mode" ve türevleri **asla** kullanılamaz (kod, değişken, rota, yorum). Yerine **"Yönetici Paneli"** veya **"Ebeveyn Paneli"**.
- **Animasyon tonu:** Profil ekranı coşkulu (framer-motion bol bol), Yönetici Paneli sade ve profesyonel.

---

## Tamamlanan İşler

### Backend / Altyapı
- `Dockerfile` — Vite dev container (port 8765)
- `docker-compose.yml` — `web` + `pb` servisleri, `pb_data` volume, healthcheck
- `.dockerignore`
- `pb_migrations/1715000000_extend_users.js` — `users` koleksiyonuna `xp`, `streak`, `last_active_date`, `completed_lessons`, `unlocked_units`, `badges` alanları

### Frontend / Auth
- `src/lib/pb.ts` — PocketBase client + `CandinUser` tipi + helpers
- `src/lib/auth.tsx` — `AuthProvider` + `useAuth()` + login/register/logout/refresh
- `src/pages/auth/Login.tsx` — Türkçe giriş formu
- `src/pages/auth/Register.tsx` — Türkçe kayıt formu (min 8 karakter şifre)
- `src/components/RequireAuth.tsx` — Auth guard wrapper
- `src/App.tsx` — `<AuthProvider>` wrap, `/giris` + `/kayit` rotaları, tüm öğrenci/admin rotaları `RequireAuth` ile korunuyor
- `src/main.tsx` — Zustand `registerActivity()` çağrısı kaldırıldı

### Frontend / Veri Bağlama
- `src/pages/student/Profil.tsx` — `useAuth().user` üzerinden PB'den `xp/streak/badges/name/avatar` okuyor + "Çıkış Yap" butonu
- `BADGE_CATALOG` Profil içinde inline (id → `{name, icon}` eşleme)

---

## Tamamlanan İşler (2026-05-16)

- **content_items koleksiyonu** (`pb_migrations/1715000100_content_items.js`): `module`, `item_id`, `order_index`, `data:JSON`. HANDOFF'taki 5 ayrı koleksiyon planı yerine tek koleksiyon (pragmatik karar).
- **Seed scripti:** `scripts/seed-pb.mjs` + `npm run seed`. Idempotent (önce siler, sonra yükler).
- **`src/lib/pbContent.ts`:** async loader'lar — `fetchDiniUnits`, `fetchUnits`, `fetchKuranLetters`, `fetchNamazFlow`, `fetchBlankQuestions`, `fetchProphetStories`.
- **`src/hooks/useProgress.ts`:** PB users record'unu güncelleyen `addXp/completeLesson/unlockUnit/awardBadge/registerActivity` hook'u. Streak logic'i burada.
- **5 öğrenci sekmesi:** Dashboard, Kuran, Namaz, Sureler, Peygamberler — tamamen PB'den okuyor. Sureler doğru cevapta `addXp` ile PB'ye yazıyor. Dashboard mount'ta `registerActivity` çağırıyor.
- **Admin Dashboard (Ebeveyn Paneli):** PB user'a bağlı. accuracyRate/totalTimeSpent/recentActivity/weakTopics henüz tracking yok → placeholder "—" ve boş listeler.
- **Temizlik:** `src/store/userStore.ts` + `src/lib/dataFetcher.ts` silindi, `zustand` paketten çıkarıldı.

## 9 Seviyeli Müfredat Geçişi (2026-05-17)

- **`dini_bilgiler.json`** — NotebookLM müfredatına göre 28 ünite, 9 seviye. Her ünitede 4 flashcard + 1 quiz.
- **`DiniUnit` tipine `level: number` eklendi** (`src/types/index.ts`).
- **`pbContent.ts`** — `fetchDiniUnits()` artık `level` alanını dolduruyor.
- **`auth.tsx`** — `register()` → `unlocked_units: ["s1_islam_muslim"]`.
- **Dashboard.tsx** — Seviye bazlı accordion: 9 seviye başlığı (emoji + isim + ilerleme çubuğu), tıklanınca ünite listesi açılıyor. Kilitli seviyeler tıklanamaz.
- **Quiz.tsx** — Seviye tamamlama bildirimi eklendi.
- **Seed** — PB'ye 37 content_items yüklendi (28 dini bilgiler + 9 diğer).

| Seviye | Konu | Ünite |
|--------|------|-------|
| 1 | Tanışma & Sevgi | 4 |
| 2 | Şehadet & Tevhid | 3 |
| 3 | Namaz & Temizlik | 4 |
| 4 | Oruç & Zekât | 3 |
| 5 | Peygamberimiz | 2 |
| 6 | Kur'an & Kutsal Mekânlar | 2 |
| 7 | İman Esasları | 4 |
| 8 | Dua & Sureler | 3 |
| 9 | Güzel Ahlak | 3 |

---

## Sıradaki İşler (TODO)

### 1. Lesson + Quiz sekmelerini PB'ye bağla
`src/pages/student/Lesson.tsx` hâlâ in-file `lessonCards` array'i kullanıyor (melekler örneği). `Quiz.tsx` da statik. İçeriği `content_items.module="dini_bilgiler"` üzerinden çek + tamamlanınca `useProgress.completeLesson(unitId, xpReward)` çağır.

### 2. Aktivite/zaman/accuracy tracking
Admin Dashboard placeholder'larını gerçek veriyle doldurmak için:
- Yeni PB koleksiyonu `activity_log` (user, date, module, action, earned_xp, status).
- `useProgress` her XP/completion event'inde log yazsın.
- Dashboard `pb.collection("activity_log").getList(...).filter user=current` ile okusun.
- accuracyRate = (success count) / (total) son N etkileşim.

### 3. Lesson tarafında `completeLesson` + `unlockUnit`
Quiz başarıyla bitince:
```ts
await completeLesson(unitId, totalXp)
await unlockUnit(nextUnitId)
```
Dashboard zinciri ona göre kilit açıyor.

### 4. `src/data/*.json` ne olacak?
Seed referansı olarak repoda kalsın. Üretimde içerik artık PB'den. Yeni içerik için seed JSON'u güncelle → `npm run seed` çalıştır.

---

## Hızlı Komutlar

```bash
# Stack durumu
docker compose ps

# Logları izle
docker logs -f candin-web
docker logs -f candin-pb

# Stack'i durdur (veri korunur)
docker compose down

# Sıfırdan başla (DİKKAT: pb_data volume'u siler, kullanıcılar gider)
docker compose down -v

# Typecheck
npx tsc --noEmit
```

---

## Bilinen Riskler

- **Colima VM reset:** `colima.yaml` mount kaybolursa container `package.json` bulamaz. Çözüm: yamlı tekrar düzenle + `colima restart`.
- **pb_data volume silinirse:** Superuser + migration tekrar uygulanır (migration JS dosyası repoda) ama kullanıcı kayıtları gider.
- **package.json değişikliği:** Yeni paket eklenirse `docker compose build --no-cache web` gerekir; sadece `up` cache'i kullanır.
