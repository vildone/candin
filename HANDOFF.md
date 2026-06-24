# Candin — Oturum Devri (Handoff)

**Son güncelleme:** 2026-06-25
**Durum:** VPS DEPLOY BAŞARILI — https://mirac.app + https://panel.mirac.app yayında!

---

## Erişim
- **Web:** https://mirac.app (nginx static serve, HTTP 200 ✓)
- **PB Admin:** https://panel.mirac.app/_/ (PocketBase admin UI)
- **PB API:** https://mirac.app/api/* (healthy ✓)

## Hesap Bilgileri

| Rol | E-posta | Şifre |
|---|---|---|
| PB Superuser / Ebeveyn | ethemkoklu@gmail.com | Ek**123719 |
| Öğrenci | ogrenci@candin.app | Test1234 |

## NPM Admin
- **URL:** http://76.13.14.41:81
- **Email:** ethemkoklu@gmail.com
- **Şifre:** Ek**123719

---

## Altyapı
- **VPS:** srv1296724.hstgr.cloud (IP: 76.13.14.41, Ubuntu 24.04, 2 CPU / 8GB RAM)
- **Domain:** mirac.app (Hostinger DNS)
  - A: @ → 76.13.14.41
  - A: panel → 76.13.14.41
  - CNAME: www → mirac.app
- **Docker:** CasaOS compose (candin_default network)
  - candin-web: ghcr.io/vildone/candin-web:latest → port 8760:80 (nginx static)
  - candin-pb: ghcr.io/muchobien/pocketbase:latest → port 8095:8090
- **NPM Proxy Hosts:**
  - mirac.app → 172.17.0.1:8760 (cert id=29, ssl_forced)
  - panel.mirac.app → 172.17.0.1:8095 (cert id=30, ssl_forced)
- **CI/CD:** GitHub Actions → GHCR (ghcr.io/vildone/candin-web:latest)
- **Repo:** https://github.com/vildone/candin (public, master)

## Repo Yapısı (CasaOS Bypass Refactor)
```
candin/
├── docker-compose.yml      # CasaOS okur (image-based, port 8760:80)
├── docker-compose.dev.yml  # Local dev (PB only)
├── Dockerfile              # Multi-stage: node build + nginx static
├── nginx.conf              # PB reverse proxy + SPA fallback
├── .github/workflows/build.yml  # GHCR image build
└── app/                    # Tüm uygulama kodu burada
    ├── package.json
    ├── src/
    ├── public/
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── index.html
    ├── pb_migrations/
    └── scripts/
```

Root'ta package.json YOK → CasaOS image: directive'ını kullanır → nginx static serve çalışır.

## CasaOS Kısıtları (Çözüldü ✅)
1. ~~package.json gördüğü için image: yoksayılır~~ → app/ alt dizinine taşındı, root'ta yok
2. ~~volumes: .:/app bozar~~ → compose'da volume yok, image kendi içeriğini kullanır
3. ~~Vite dev server production'da çalışır~~ → Artık nginx static serve (multi-stage Dockerfile)

---

## Yapılacaklar

### Kısa Vadeli
1. PB migrations çalıştır → koleksiyonları oluştur
2. Seed data → öğrenci hesapları, ders içerikleri
3. www.mirac.app SSL → NPM'de ayrı cert veya wildcard

### Orta Vadeli
4. Code splitting → JS bundle 1MB (react-pdf büyük), dynamic import
5. PB admin UI nginx proxy → mirac.app/_/ yolundan erişim (opsiyonel)

---

## Hızlı Komutlar

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"

# Local dev
docker compose -f docker-compose.dev.yml up -d pb
cd app && npm install && npm run dev    # port 8765

# Build
cd app && npx tsc --noEmit && npx vite build

# Deploy (push → GHCR build → MCP update)
git push origin master
# MCP: deleteProject + createNewProject(GitHub URL)

# Test
curl https://mirac.app/api/health
curl -o /dev/null -w "%{http_code}" https://mirac.app/
curl -o /dev/null -w "%{http_code}" https://panel.mirac.app/_/
```
