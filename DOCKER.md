# 🐳 Menjalankan Kasirnya dengan Docker

Biar bisa clone dari GitHub & jalan di device mana aja tanpa install Node/npm — cukup punya **Docker Desktop**.

## Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) terinstall & lagi nyala.

## 1. Clone & masuk folder
```bash
git clone <repo-url>
cd kasir-nya
```

## 2. (Opsional) Set kredensial Supabase
Tanpa ini, app tetap jalan di **demo mode** (data di localStorage).
```bash
cp .env.example .env
# edit .env, isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
```

## 3. Jalanin — mode Development (hot reload)
```bash
docker compose up dev
```
Buka **http://localhost:5173** — edit code di host, langsung ke-reflect (hot reload udah jalan via polling, aman di Windows/Mac/Linux).

Stop: `Ctrl+C`, atau bersihin container:
```bash
docker compose down
```

## 4. (Opsional) Mode Production (build + nginx)
Build static lalu serve via nginx di port 8080:
```bash
docker compose --profile prod up --build prod
```
Buka **http://localhost:8080**.

> Catatan: di mode production, env `VITE_*` di-*embed* saat build. Pastikan `.env` udah keisi **sebelum** build.

## Catatan teknis
- `Dockerfile` multi-stage: `dev` (hot reload), `build`, `prod` (nginx).
- Node 24 Alpine. `node_modules` di-isolasi di volume container — gak nimpa folder host.
- File watching pakai polling (`VITE_USE_POLLING=true`) supaya reload jalan walau bind mount Windows gak ngirim FS event.
- Folder `android/` (Capacitor) di-exclude lewat `.dockerignore`.
