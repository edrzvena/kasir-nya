# Menjalankan Kasirnya dengan Docker

Dokumen ini menjelaskan cara menjalankan aplikasi melalui Docker, sehingga repo dapat di-clone dan dijalankan di berbagai perangkat tanpa perlu memasang Node atau npm secara langsung.

## Prasyarat

[Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terpasang dan sedang berjalan.

## 1. Clone dan masuk ke folder

```bash
git clone <repo-url>
cd kasir-nya
```

## 2. Atur kredensial Supabase (opsional)

Langkah ini dapat dilewati. Tanpa kredensial, aplikasi tetap berjalan dalam mode demo dengan data tersimpan di localStorage.

```bash
cp .env.example .env
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada berkas .env
```

## 3. Mode Development (hot reload)

```bash
docker compose up dev
```

Buka http://localhost:5173. Perubahan kode pada host langsung tercermin karena hot reload aktif melalui polling, yang berfungsi di Windows, macOS, maupun Linux.

Untuk menghentikan, tekan `Ctrl+C`, lalu bersihkan container:

```bash
docker compose down
```

## 4. Mode Production (build dan nginx, opsional)

Membangun versi static lalu menyajikannya melalui nginx pada port 8080:

```bash
docker compose --profile prod up --build prod
```

Buka http://localhost:8080.

Pada mode production, environment variable `VITE_*` ditanamkan saat proses build. Pastikan berkas `.env` sudah terisi sebelum menjalankan build.

## Catatan Teknis

- `Dockerfile` menggunakan multi-stage: `dev` (hot reload), `build`, dan `prod` (nginx).
- Basis image Node 24 Alpine. Folder `node_modules` diisolasi pada volume container sehingga tidak menimpa folder pada host.
- Pemantauan berkas menggunakan polling (`VITE_USE_POLLING=true`) agar reload tetap berjalan meskipun bind mount Windows tidak mengirim event filesystem.
- Folder `android/` (Capacitor) dikecualikan melalui `.dockerignore`.
