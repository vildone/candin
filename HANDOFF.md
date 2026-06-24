# Candin — Oturum Devri (Handoff)

**Son güncelleme:** 2026-06-25
**Durum:** VPS DEPLOY TAMAMLANDI — https://mirac.app + https://panel.mirac.app yayında!

---

## Erişim
- **Web:** https://mirac.app (nginx static serve, HTTP 200 ✓)
- **PB Admin:** https://panel.mirac.app/_/ (PocketBase admin UI)
- **PB API:** https://mirac.app/api/* (healthy ✓)
- **Skill:** `candin-deploy` (devops kategorisi)

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
  - candin-pb: ghcr.io/vildone/candin-pb:latest → port 8095:8090 (+ migrations)
- **NPM Proxy Hosts:**
  - mirac.app → 172.17.0.1:8760 (cert id=29, ssl_forced)
  - panel.mirac.app → 172.17.0.1:8095 (cert id=30, ssl_forced)
- **CI/CD:** GitHub Actions → GHCR (2 workflow: web + pb)
- **Repo:** https://github.com/vildone/candin (public, master)

## Repo Yapısı (CasaOS Bypass)

```
candin/
├── docker-compose.yml      # CasaOS okur (image-based, port 8760:80)
├── docker-compose.dev.yml  # Local dev (PB only)
├── Dockerfile              # Multi-stage: node build + nginx static
├── Dockerfile.pb           # PocketBase + migrations image
├── nginx.conf              # PB reverse proxy + SPA fallback
├── .github/workflows/
│   ├── build-web.yml       # candin-web image build
│   └── build-pb.yml        # candin-pb image build
└── app/                    # Tüm uygulama kodu burada
    ├── package.json
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── data/           # Seed data JSON'ları
    │   └── types/
    ├── public/
    ├── pb_migrations/      # PB schema migrations
    ├── scripts/
    │   └── seed-pb.mjs     # Seed data yükleme scripti
    ├── vite.config.ts
    ├── tsconfig*.json
    └── index.html
```

**Neden app/?** CasaOS root'ta `package.json` gördüğü için `image:` directive'ını yoksayıp default Node.js image ile `npm run dev` çalıştırıyor. Root'ta package.json olmaması → image: kullanılır → nginx static serve çalışır.

---

## Canlı Düzenleme Workflow'u

**ÖNEMLİ:** Bundan sonra tüm düzenlemeler canlıda Hostinger MCP ile yapılacak.

### Adımlar:
1. **Kodu değiştir** → `app/` altında dosya düzenle
2. **Typecheck** → `cd app && npx tsc --noEmit`
3. **Commit + Push** → `git push origin master`
4. **GHCR Build** → GitHub Actions otomatik tetiklenir (~2 dk)
5. **VPS Deploy** → MCP ile deleteProject + createNewProject
6. **Test** → `curl https://mirac.app/api/health`

### MCP Komutları:
```
mcp_hostinger_VPS_deleteProjectV1(candin, 1296724)
# 20s bekle
mcp_hostinger_VPS_createNewProjectV1(https://github.com/vildone/candin, candin, 1296724)
# 75s bekle
mcp_hostinger_VPS_getProjectContainersV1(candin, 1296724)
```

### Seed Data:
```bash
PB_URL=https://panel.mirac.app PB_EMAIL=ethemkoklu@gmail.com PB_PASSWORD=*** \
  node app/scripts/seed-pb.mjs
```

---

## Bilinen Sorunlar ve Çözümleri

### CasaOS Package.json Sorunu ✅ Çözüldü
Root'ta package.json → image: yoksayılır → Vite dev server çalışır.
**Çözüm:** app/ alt dizinine taşı.

### CasaOS Volume Mount Sorunu ✅ Çözüldü
volumes: .:/app → temp context silinir → container /app boş kalır.
**Çözüm:** Volume kaldır, image kendi içeriğini kullansın.

### NPM LE Sertifika Sorunu ✅ Çözüldü
Cert API'sinde meta'da letsencrypt_email/letsencrypt_agree kabul edilmez.
**Çözüm:** Cert oluştururken sadece dns_challenge: false, PUT'ta letsencrypt_agree.

### GitHub Actions Visibility Step ✅ Çözüldü
Visibility step curl quoting hatası veriyor.
**Çözüm:** Step kaldırıldı, image zaten public.

---

## Yapılacaklar

### Kısa Vadeli
1. ~~PB migrations~~ ✅ (ghcr.io/vildone/candin-pb image'ında)
2. ~~Seed data~~ ✅ (59 kayıt yüklendi)
3. www.mirac.app SSL → NPM'de ayrı cert veya wildcard

### Orta Vadeli
4. Code splitting → JS bundle 1MB (react-pdf büyük), dynamic import
5. PB admin UI nginx proxy → mirac.app/_/ yolundan erişim (opsiyonel)
6. Yeni öğrenci hesabı oluşturma flow'u

---

## Hızlı Komutlar

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"

# Local dev
docker compose -f docker-compose.dev.yml up -d pb
cd app && npm install && npm run dev    # port 8765

# Typecheck
cd app && npx tsc --noEmit

# Production build test
cd app && npx vite build

# Deploy (push → GHCR build → MCP update)
git add -A && git commit -m "feat: ..." && git push origin master
# Sonra MCP ile VPS deploy (yukarıdaki adımlar)

# Seed data
PB_URL=https://panel.mirac.app PB_EMAIL=ethemkoklu@gmail.com PB_PASSWORD=*** \
  node app/scripts/seed-pb.mjs

# Test
curl -o /dev/null -w "%{http_code}" https://mirac.app/
curl https://mirac.app/api/health
curl -o /dev/null -w "%{http_code}" https://panel.mirac.app/_/
```
