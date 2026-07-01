# Miraç — Oturum Devri (Handoff)

**Son güncelleme:** 2026-07-01 16:00
**Durum:** KARARLI — Tüm içerik yüklü, superuser aktif, dersler açık.

---

## Erişim

| Servis | URL | Kimlik |
|--------|-----|--------|
| Web | https://mirac.app | — |
| Admin Panel | https://panel.mirac.app/_/ | `ethemkoklu@gmail.com` / `Ek**123719` |
| API | https://mirac.app/api/health | — |
| NPM | http://76.13.14.41:81 | `ethemkoklu@gmail.com` / `Ek**123719` |

**Test hesabı (öğrenci):** `ethem@mirac.app` / `Test1234`

---

## Altyapı

- **VPS:** srv1296724.hstgr.cloud (76.13.14.41, 2 CPU / 8 GB / 100 GB)
- **VPS Root:** `ssh root@76.13.14.41` şifre: `MiracAdmin-2026` (dosya: `/tmp/vps_pw.txt`)
- **Container:** mirac-web (nginx, port 8760:80), mirac-pb (PocketBase v0.39.5, port 8095:8090)
- **PB Volume:** `pb_data` (Docker named volume)
- **NPM:** mirac.app → 172.17.0.1:8760, panel.mirac.app → 172.17.0.1:8095
- **DNS (Hostinger):** @ A → 76.13.14.41, panel A → 76.13.14.41, www CNAME → mirac.app
- **CI/CD:** GitHub Actions → GHCR (build-web-image, build-pb-image)
- **Repo:** https://github.com/vildone/candin (public, master)

---

## Repo Yapısı

```
candin/
├── docker-compose.yml      # ghcr.io/vildone/candin-web + ghcr.io/muchobien/pocketbase
├── Dockerfile              # Multi-stage: node:22-alpine build → nginx:1.27-alpine (curl health check)
├── nginx.conf              # SPA fallback + /api/* → mirac-pb:8090 proxy
├── Dockerfile.pb           # muchobien/pocketbase + migrations
├── pb-init.sh              # (kullanılmıyor - PB v0.39.5 JS migration desteklemez)
├── .github/workflows/
│   ├── build-web.yml       # app/** trigger
│   └── build-pb.yml        # Dockerfile.pb + pb-init.sh trigger
└── app/
    ├── package.json        # React 19 + Vite 7 + TypeScript 5.9 + Tailwind 4
    ├── src/
    │   ├── lib/pb.ts       # PocketBase client (VITE_PB_URL ?? "/")
    │   ├── lib/auth.tsx    # AuthProvider (login "users", register "users")
    │   ├── lib/pbContent.ts # PB API helpers (fetchDiniUnits, fetchDualar, vb.)
    │   ├── hooks/useProgress.ts
    │   ├── pages/auth/     # Login, Register
    │   ├── pages/student/  # Dashboard, Lesson, Dualar, Kuran, Namaz, vb.
    │   └── data/           # elifba_dersler.json + PB seed JSON'ları
    ├── public/             # mirac-*.png favicon'lar
    ├── pb_migrations/      # .js formatında (PB v0.23+ çalıştırmaz!)
    └── scripts/seed-pb.mjs # PB seed script
```

---

## Kritik Bilgiler

### 1. PocketBase v0.39.5 — JS Migration YOK

PB v0.23+ sadece `.go` migration kabul eder. Eski `.js` migration'lar ÇALIŞMAZ.
**Yapılan:** Koleksiyonlar API ile manuel oluşturuldu.

### 2. content_items Koleksiyonu

53 kayıt, 6 modül. Schema: `module` (text), `item_id` (text), `order_index` (number), `data` (json).
Oluşturma komutu (gerektiğinde):
```js
await pb.collections.create({
    name: 'content_items', type: 'base',
    fields: [
        {name: 'module', type: 'text', required: true},
        {name: 'item_id', type: 'text', required: true},
        {name: 'order_index', type: 'number', required: true},
        {name: 'data', type: 'json', required: true},
    ],
});
```

### 3. Users Koleksiyonu — 6 Özel Alan

Eklenen alanlar: `xp` (number), `streak` (number), `last_active_date` (text), `completed_lessons` (json), `unlocked_units` (json), `badges` (json).

**Bu alanlar olmadan dersler kilitli kalır!**

### 4. Superuser

`muchobien/pocketbase` imajı varsayılan `__pbinstaller@example.com` superuser'ı ile gelir.
Değiştirmek için SSH ile:
```bash
sshpass -f /tmp/vps_pw.txt ssh root@76.13.14.41 \
  "docker exec mirac-pb /usr/local/bin/pocketbase superuser create ethemkoklu@gmail.com 'Ek**123719' --dir=/pb_data"
```

### 5. Deploy

**Standart (veri korur):**
```python
mcp.call("VPS_updateProjectV1", {"projectName": "candin", "virtualMachineId": 1296724})
```

**Sıfırdan (veri SİLİNİR):**
```python
mcp.call("VPS_deleteProjectV1", {"projectName": "candin", "virtualMachineId": 1296724})
time.sleep(30)
mcp.call("VPS_createNewProjectV1", {"virtualMachineId": 1296724, "project_name": "candin", "content": compose_yaml})
# Sonra: SSH ile superuser oluştur, API ile koleksiyon oluştur, seed çalıştır
```

### 6. MCP Araçları

Token: `ek06cN...` (~/.hermes/config.yaml → mcp_servers.hostinger.env.API_TOKEN)
Kullanım: Python subprocess ile `npx hostinger-api-mcp@latest` JSON-RPC.

**Parametre dikkat:** `deleteProject`/`getProjectContainers` → `projectName` (camelCase). `createNewProject` → `project_name` (snake_case). VM ID her yerde `virtualMachineId` (camelCase, integer).

### 7. GitHub Push

Repo `vildone/candin`. `gh auth switch --user vildone` gerekebilir.
Push komutu: `git push "https://vildone:$(gh auth token)@github.com/vildone/candin.git" master`

---

## Yapılan Değişiklikler (Bu Oturum)

1. Health check: wget → curl (Alpine busybox uyumsuzluğu)
2. Miraç rebranding: logo, isim, container isimleri
3. Login placeholder: `isim@mailadresiniz.com`
4. Kuran görselleri: `h-20 w-20 sm:h-24 sm:w-24`
5. Kuran Arapça metin: `text-3xl sm:text-5xl`
6. Superuser: SSH ile oluşturma yöntemi
7. content_items koleksiyonu: schema düzeltildi + 53 kayıt seed
8. Users koleksiyonu: 6 özel alan eklendi
9. `unlocked_units` fix: kayıt sırasında 3 seviye-1 ünitesi açılıyor

---

## Hızlı Komutlar

```bash
cd "/Volumes/King/Vibe/Canım Dinim/Candin"

# Local dev
cd app && npm install && npm run dev

# Typecheck
cd app && npx tsc --noEmit

# Deploy zinciri
git add -A && git commit -m "feat: ..."
git push "https://vildone:$(gh auth token)@github.com/vildone/candin.git" master
# Build bekle (130s), sonra:
python3 -c "
import subprocess,json,os,time
env=os.environ.copy()
env['API_TOKEN']='ek06cN...'
# MCP updateProject çağrısı
"

# Seed (superuser auth ile)
cd app && PB_URL=https://panel.mirac.app PB_EMAIL=ethemkoklu@gmail.com PB_PASSWORD='Ek**123719' node scripts/seed-pb.mjs

# Test
curl https://mirac.app/api/health
curl https://panel.mirac.app/_/
```

---

## Bilinen Sorunlar

- PB v0.39.5 `.js` migration çalıştırmaz → API ile manuel şema yönetimi gerek
- `deleteProject` + `createNewProject` tüm veriyi siler → `updateProject` kullan
- CasaOS `package.json` görünce `image:` yoksayar → `app/` alt dizin yapısı
- NPM forward_host `127.0.0.1` değil `172.17.0.1` olmalı
- `VPS_attachPublicKeyV1` güvenilmez → şifreli SSH kullan
- `docker-compose.yml` volume mount'ları CasaOS temp dir temizliğinde bozulabilir
