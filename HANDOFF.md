# Candin — Oturum Devri (Handoff)

**Son güncelleme:** 2026-06-25
**Durum:** VPS DEPLOY BAŞARILI — https://mirac.app yayında!

---

## 🚀 VPS Deploy — TAMAMLANDI

### Erişim
- **Web:** https://mirac.app (HTTP 200 ✓)
- **PB API:** https://mirac.app/api/* (healthy ✓)
- **PB Admin:** http://76.13.14.41:8095/_/
- **SSL:** Let's Encrypt (cert id=29, NPM)

### Altyapı
- **VPS:** srv1296724.hstgr.cloud (ID: 1296724, IP: 76.13.14.41, Ubuntu 24.04)
- **Domain:** mirac.app → A record 76.13.14.41 (Hostinger DNS)
- **Docker:** CasaOS compose (candin_default network)
  - candin-web: ghcr.io/vildone/candin-web:latest → port 8760:8765 (Vite dev)
  - candin-pb: ghcr.io/muchobien/pocketbase:latest → port 8095:8090
- **Reverse Proxy:** nginx-proxy-manager (NPM)
  - Proxy host id=13: mirac.app → 172.17.0.1:8760, cert id=29, ssl_forced=true
- **CI/CD:** GitHub Actions → GHCR image build (ghcr.io/vildone/candin-web:latest)

### GitHub
- **Repo:** https://github.com/vildone/candin (public, master branch)
- **Actions:** `.github/workflows/build.yml` — push'ta otomatik image build + GHCR push + public visibility
- **Image:** ghcr.io/vildone/candin-web:latest (public, ~266MB)

### CasaOS Kısıtları (ÖNEMLİ)
1. `package.json` gördüğü için compose'daki `image:` direktifi yoksayılır — default Node.js image ile `npm run dev` çalıştırılır
2. `volumes: .:/app` mount'u BOZAR — CasaOS compose'u temp dizininden çalıştırır, context silinir
3. **Sonuç:** Vite dev server production'da çalışır (optimize değil ama çalışır). nginx + static build için sub-directory refactor veya SSH manual setup gerekir.

### Portlar
| Servis | Host Port | Container Port | Açıklama |
|--------|-----------|----------------|----------|
| Web (Vite) | 8760 | 8765 | NPM → 172.17.0.1:8760 |
| PB | 8095 | 8090 | Debug/admin (NPM /api proxy via web) |

### PB Superuser
- **Admin URL:** http://76.13.14.41:8095/_/
- **İlk kurulum token'i log'da (expired olabilir, restart → yeni token)**
- **Hesap:** ethemkoklu@gmail.com / Ek**123719

---

## Yapılması Gerekenler (Sonraki Oturum)

### Kısa Vadeli
1. **PB Superuser oluştur** — http://76.13.14.41:8095/_/ üzerinden
2. **PB migrations çalıştır** — `pb_migrations/` mount edildi, ilk başlatmada otomatik
3. **Seed data** — Öğrenci hesapları, ders içerikleri
4. **Vite production build refactor** (sub-directory: `app/` + multi-stage Dockerfile nginx ile)

### Orta Vadeli
5. **www.mirac.app SSL** — NPM'de ayrı cert veya wildcard
6. **PB admin proxy** — web vite config'e `/_/` proxy ekle
7. **Code splitting** — JS bundle 1MB (react-pdf büyük), dynamic import ile böl

---

## Yeni Özellikler (Mevcut)

### Responsive/Mobil
- viewport-fit=cover, safe area, text-xs→12px, touch hedefleri 40px
- PDF okuyucu mobil redesign, zoom/nav ayrıldı
- Namaz stepper çemberi 28→36px

### Header
- `src/components/Header.tsx` — Logo + kullanıcı menüsü
- StudentLayout'a entegre

### Kitaplar Sekmesi
- `src/pages/student/Kitaplar.tsx` + `KitapDetail.tsx`
- `public/kutlu-yolculuk.pdf` — Diyanet Çocuk, 52 sayfa
- Route: `/kitaplar` ve `/kitaplar/:kitapId`

### Altyapı
- vite.config.ts: host 0.0.0.0, PORT env, VITE_PB_PROXY env, allowedHosts
- src/lib/pb.ts: PB_URL='/' (Vite proxy üzerinden)
- docker-compose.yml: VPS production (image-based)
- docker-compose.dev.yml: local development (PB only)
- Dockerfile: multi-stage (nginx) — CasaOS kısıtı nedeniyle kullanılmıyor ama refactor sonrası aktif olacak
- nginx.conf: PB reverse proxy + SPA fallback (refactor sonrası)

---

## Hesap Bilgileri

| Rol | E-posta | Şifre |
|---|---|---|
| Ebeveyn/Superuser | ethemkoklu@gmail.com | Ek**123719 |
| Öğrenci | ogrenci@candin.app | Test1234 |

---

## NPM Admin
- **URL:** http://76.13.14.41:81
- **Email:** ethemkoklu@gmail.com
- **Şifre:** Ek**123719

## Hostinger MCP
- **Token:** ek06cNNInpI3WIb4K5znp6ZJWTC4FOXmVmgRfMWu460b255e

---

## Hızlı Komutlar

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"

# Local dev
docker compose -f docker-compose.dev.yml up -d pb  # PB only
npm run dev                                          # port 8765

# Build
npx tsc --noEmit        # typecheck
npx vite build          # production build → dist/

# Deploy (push → GHCR build → MCP update)
git push origin master
# sonra MCP: deleteProject + createNewProject(GitHub URL)

# Test
curl https://mirac.app/api/health
curl http://76.13.14.41:8760/
```
