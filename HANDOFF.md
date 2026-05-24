# Candin — Oturum Devri (Handoff)

**Son güncelleme:** 2026-05-24
**Durum:** 5 sekmeli yeni mimari tamamlandı — Kur'an elifbası (28 ders, lokal), Dualar (22), Namaz (17 adım, Hanefi), Hikayeler. PB'ye seed edildi.

---

## Çalışan Stack

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"
npm run dev        # Vite dev server (port 8765)
```

- **Web (Vite + React):** http://localhost:8765
- **PocketBase API:** http://localhost:8090 (SSH tunnel üzerinden)
- **PocketBase Admin UI:** http://localhost:8090/_/

### Superuser
- E-posta: `ethemkoklu@gmail.com`
- Şifre: `Ek**123719`

---

## Önemli Gotcha'lar

### 1. Vite port: 8765
`vite.config.ts`'te `server.port: 8765, strictPort: true`. Değiştirme.

### 2. Seed script
```bash
node scripts/seed-pb.mjs
```
Tüm content_items'ları siler, JSON'dan yeniden yükler. Idempotent.

### 3. elifba_dersler.json — statik JSON'dan okunur
Kur'an sekmesi `pbContent.fetchElifbaDersler()` ile `src/data/elifba_dersler.json`'dan okur, PocketBase'den değil. Medya dosyaları `public/elifba/dersN/` altında.

### 4. Amiri font — index.html'de Google Fonts
Arapça metinler için Amiri fontu `index.html`'de `<link>` ile yüklü. Kaldırma.

### 5. Türkçe dosya yolu
Proje yolu `/Volumes/King/Vibe/Canım Dinim/Candin` — path'leri tırnak içine al.

---

## Kullanıcının KESİN Kuralları

- **Türkçe:** Tüm UI metinleri Türkçe.
- **Yasaklı isimlendirme:** "god-mode" ve türevleri kullanılamaz. Yerine "Yönetici Paneli" veya "Ebeveyn Paneli".
- **Animasyon tonu:** Profil coşkulu, Yönetici Paneli sade.

---

## Tamamlanan İşler

### 5 Sekmeli Yeni Mimari (2026-05-24)

Bottom nav: `📖 Dersler | 🤲 Dualar | 🌹 Hikayeler | 💬 Namaz | 🌙 Kur'an`

**Dersler sekmesi** (mevcut Duolingo yapısı, hiç değişmedi):
- 9 seviye, 28 ünite, her ünitede kart + quiz
- Dashboard → seviye accordion → ünite kartları

**Dualar sekmesi** (yeni):
- 22 dua/sure listesi, kategori filtreleme, arama
- Detay sayfası: Arapça (Amiri font), okunuş, anlam, kelime kelime analiz
- Ses butonu (audioSrc varsa), "Öğrenildi" işaretleme (localStorage)
- Dosyalar: `src/pages/student/Dualar.tsx`, `DuaDetail.tsx`

**Hikayeler sekmesi** (yeni):
- Liste: emoji, başlık, özet, okuma süresi
- Detay: tam metin (paragraf), önemli dersler, "Öğrenildi"
- Dosyalar: `src/pages/student/Hikayeler.tsx`, `HikayeDetail.tsx`

**Namaz sekmesi** (yeniden yazıldı):
- 17 adım: 9 abdest + 8 namaz kılınışı
- Bölüm başlıkları: "💧 Abdest" / "🕌 Namaz Kılınışı"
- Her adımda: detaylı açıklama + "Namazda Okunanlar" (Arapça + okunuş + anlam, Amiri font)
- Hanefi mezhebine göre tüm dualar
- Dosya: `src/pages/student/Namaz.tsx`

**Kur'an sekmesi** (elifba — tamamen yeniden):
- 28 elifba dersi (onderalkan.com'dan alındı)
- Liste: 2 sütunlu grid, ders numarası + başlık + istatistik
- Detay: harf grid (3/4/5 sütun responsive), tıkla → ses dinle, açıklamalar, yöntem
- 745 ses + 745 görsel — hepsi `public/elifba/dersN/` altında LOKAL
- Dosya: `src/pages/student/Kuran.tsx`

### Veri Katmanı

| Dosya | Açıklama |
|---|---|
| `src/types/index.ts` | Dua, Hikaye, NamazReading, ElifbaDers, LearnedItem tipleri |
| `src/lib/pbContent.ts` | fetchDualar(), fetchHikayeler(), fetchElifbaDersler(), fetchNamazFlow() (tüm birimleri birleştirir) |
| `src/hooks/useProgress.ts` | markLearned/unmarkLearned/isLearned/getLearnedCount (localStorage) |
| `src/data/dualar.json` | 22 dua/sure seed data (PocketBase'ye yüklendi) |
| `src/data/elifba_dersler.json` | 28 elifba dersi (statik JSON, PocketBase'den değil) |
| `src/data/namaz.json` | 17 adım (9 abdest + 8 namaz) + her adımda readings |
| `src/data/namaz_dualar_sureler.json` | PDF'den çıkarılan ham data (referans) |

### PocketBase Seed

```
dini_bilgiler: 28
elifba:        3
namaz:         2
sureler:       2
peygamberler:  2
dualar:       22
Toplam:       59
```

### Font
- **Amiri** (Google Fonts) — `index.html`'de yüklü
- Arapça metinler: `style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}`

---

## Sıradaki İşler (TODO)

### 1. Namaz/Abdest Görselleri
Ethem PDF'den görsel temin edecek. `public/images/namaz/` klasörüne koyulacak, `namaz.json`'daki `image_src` alanları güncellenecek.

### 2. Hikayeler İçeriği
Peygamber hikayeleri seed data'sı henüz yok. Ethem referans verecek.

### 3. Dualar — Seslendirme
Ücretsiz Arapça seslendirme API'si araştırılacak. Her duaya `audioSrc` eklenecek.

### 4. Dersler sekmesi — İçerik güncelleme
Diğer sekmeler tamamlandıktan sonra dersler yeniden düzenlenecek.

### 5. Aktivite/zaman/accuracy tracking
Admin Dashboard placeholder'ları hala boş.

---

## Commit

```
17ebded feat: 5 sekmeli yeni mimari — Kur'an elifbası (28 ders), Dualar (22), Namaz (17 adım), Hikayeler
```

1517 files changed, ~40MB elifba medyası.

---

## Hızlı Komutlar

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"

# Dev server
npm run dev                # port 8765

# PocketBase (SSH tunnel üzerinden)
# Port 8090 zaten tunnel'da

# Typecheck
npx tsc --noEmit

# Seed (tüm PB içeriğini yeniden yükle)
node scripts/seed-pb.mjs
```
