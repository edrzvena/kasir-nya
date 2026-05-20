<div align="center">

# 🧾 Kasirnya

**Aplikasi kasir (POS) + dashboard admin untuk cafe & retail Indonesia.**

Dibangun dengan React 19, TypeScript, Tailwind v4, dan Supabase. Bisa langsung jalan dalam **demo mode** tanpa setup database.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## 📑 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Setup Supabase (Opsional)](#-setup-supabase-opsional)
- [Alur Penggunaan](#-alur-penggunaan)
- [Role & Akses](#-role--akses)
- [Struktur Proyek](#-struktur-proyek)
- [Highlight Teknis](#-highlight-teknis)
- [Scripts](#-scripts)
- [Deploy](#-deploy)

---

## 🎯 Tentang Proyek

**Kasirnya** adalah aplikasi web POS (Point of Sale) yang dirancang untuk usaha cafe & retail skala kecil-menengah di Indonesia. Cocok untuk owner yang butuh sistem kasir digital dengan dashboard admin lengkap — tapi tanpa ribet setup server atau langganan SaaS mahal.

**Yang bikin beda:**

- ⚡ **Dual Mode** — Bisa langsung jalan di **demo mode** (localStorage) tanpa Supabase, atau full **cloud mode** dengan PostgreSQL untuk produksi.
- 🏪 **Multi-store** — Setiap admin punya outlet sendiri, data antar toko terisolasi otomatis lewat `store_id`.
- 👥 **Role-based** — Admin akses penuh ke semua fitur; kasir cuma dapat POS & Invoices.
- 💾 **In-memory cache** — Navigasi antar halaman instan, write op otomatis invalidate cache.
- 💵 **PPN 11%** & **format Rupiah** otomatis di semua transaksi.

---

## ✨ Fitur Utama

### 🛒 POS Cashier
Cart real-time, search produk, pilih kategori, input nama pelanggan, catatan per item, pilih metode bayar (**Cash / QRIS**), checkout langsung cetak struk thermal-style 80mm. Stok produk auto-decrement. Untuk QRIS, modal sukses nampilin mockup QR code.

### 📦 Catalog Management
CRUD produk lengkap (nama, harga, kategori, stok, deskripsi) + manajemen kategori dengan **emoji picker**. Optimistic UI — UI update duluan, sinkron ke DB di background.

### 📊 Sales Performance
- Grafik revenue (line chart) per rentang tanggal
- KPI cards: total revenue, transaksi, AOV, growth %
- **Custom date range picker** (tanpa library eksternal)
- Top produk & breakdown kategori (donut chart)
- Daftar penjualan dengan breakdown subtotal + PPN per transaksi
- **Export CSV** kompatibel Excel (UTF-8 BOM) — lengkap dengan kolom PPN 11%

### 🧾 Invoices
Daftar transaksi historis dengan detail item, total, metode bayar, kasir, dan pelanggan. Bisa cetak ulang struk kapan aja — template-nya identik dengan struk yang keluar saat checkout di POS.

### 👤 Customer Management
Stats pelanggan (jumlah kunjungan, total belanja, last visit) otomatis ter-update setelah setiap transaksi.

### 👔 Manage Staff
Admin bisa buat akun kasir dengan **username + PIN** per outlet. Kasir login pakai email admin + username + PIN.

### 🏢 Multi-tenant
Setiap admin punya `store_id` sendiri. RLS Supabase + filter di app layer memastikan data antar toko gak bocor.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | Tailwind CSS v4, Plus Jakarta Sans |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) — cloud mode |
| **Fallback** | localStorage — demo mode |
| **Auth** | Supabase Auth + custom PIN flow untuk kasir |
| **Compiler** | React Compiler (babel-plugin-react-compiler) |

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-username/kasir-nya.git
cd kasir-nya
npm install
```

### 2. Jalankan dev server

```bash
npm run dev
```

Buka **http://localhost:5173** — selesai. App langsung jalan dalam **demo mode** dengan data sample (dua toko: **Cafe Boy** & **Cafe Girl**).

> 💡 Demo mode pakai localStorage. Mau pakai database beneran? Lanjut ke step di bawah.

---

## ☁️ Setup Supabase (Opsional)

Cuma perlu kalau mau pakai cloud database & multi-device sync.

### 1. Bikin project di [supabase.com](https://supabase.com)

### 2. Copy kredensial ke `.env`

```bash
cp .env.example .env
```

Isi `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> 🔍 Dapetin kredensial dari: **Supabase Dashboard → Settings → API**

### 3. Jalankan schema SQL

Buka **Supabase SQL Editor**, paste isi file `supabase_schema.sql`, lalu **Run**.

Table yang dibuat:

```
stores · profiles · products · categories
customers · transactions · cashiers
```

Semua table pakai RLS dengan policy `USING (true)` — isolasi data antar toko dihandle di app layer via `store_id`.

### 4. Restart dev server

```bash
npm run dev
```

App sekarang nyambung ke Supabase. Register akun admin baru di tab **Register**.

---

## 🎬 Alur Penggunaan

### Mode Demo (langsung pakai)

Buka app → otomatis login sebagai admin demo → mainkan semua fitur. Data tersimpan di localStorage browser.

### Mode Cloud (production)

```
1. Register admin baru          → tab "Register"
2. Login sebagai admin          → tab "Admin"
3. Tambah produk & kategori     → halaman "Catalog"
4. Buat akun kasir              → halaman "Manage Staff"
5. Kasir login                  → tab "Cashier PIN" (email + username + PIN)
```

### Alur Transaksi

```
Login (Admin/Kasir)
  ↓
POS Cashier → pilih produk → input nama pelanggan
  ↓
Checkout → pilih metode bayar (Cash / QRIS)
  ↓
Struk auto-tersimpan di "Invoices"
  ↓
Stok produk berkurang otomatis
  ↓
Dashboard & Sales Performance ter-update
```

---

## 🔐 Role & Akses

| Halaman            | Admin | Kasir |
|--------------------|:-----:|:-----:|
| Dashboard          |   ✅  |   —   |
| POS Cashier        |   ✅  |   ✅  |
| Invoices           |   ✅  |   ✅  |
| Catalog            |   ✅  |   —   |
| Sales Performance  |   ✅  |   —   |
| Manage Staff       |   ✅  |   —   |
| Profile            |   ✅  |   ✅  |
| Help Center        |   ✅  |   ✅  |

---

## 📁 Struktur Proyek

```
src/
├── api/              # Domain service layer (auth, products, categories, dll)
├── components/
│   ├── layout/       # Navbar, Sidebar, MainLayout
│   ├── modal/        # Modal (Add/Edit Product, Sign Out, dll)
│   └── ui/           # Komponen reusable (Button, Card, Badge, ...)
├── pages/
│   ├── admin/        # Dashboard, Catalog, Sales, Staff, Profile
│   ├── shared/       # POS, Invoices, Help (admin + kasir)
│   └── auth/         # Login, Register, Forgot/Reset Password
├── sections/         # Section UI per halaman
│   ├── pos/          # POSSection, ProductGrid, CartDrawer
│   ├── catalog/      # CatalogSection, CategoryManager, CatalogGrid, CatalogTable
│   ├── sales/        # SalesSection, KPIOverview, RevenueChart, CategoryDonut,
│   │                 #   DateRangePicker, SalesTable, TopProductsTable
│   ├── invoices/     # InvoicesSection, InvoicesTable, ReceiptSidebar
│   ├── dashboard/    # StatsGrid, RecentActivity
│   ├── staff/        # StaffSection
│   ├── profile/      # ProfileSection
│   └── help/         # HelpSection
└── lib/
    └── db.ts         # Re-export barrel dari src/api/
```

---

## 🧠 Highlight Teknis

Beberapa pattern menarik yang dipakai di proyek ini:

### In-memory cache dengan TTL
`src/lib/db.ts` punya cache helpers (`fromCache`, `toCache`, `bustCache`) dengan TTL 2 menit. Semua getter cek cache dulu — navigasi antar halaman jadi instan. Write op otomatis invalidate cache.

### Throw on Supabase error
Write op gak silent fallback ke localStorage — kalau Supabase error, langsung `throw new Error(error.message)`. Mencegah "data hantu" yang cuma muncul lokal tapi gak masuk DB.

### refreshTrigger pattern
Parent component naikin integer counter → children re-fetch via `useEffect([storeId, refreshTrigger])`. Pattern sederhana buat trigger sync antar component sibling.

### Conditional modal rendering
```tsx
{isAddOpen && <AddProductModal ... />}
{isEditOpen && selectedProduct && <EditProductModal ... />}
```
Modal mount fresh setiap dibuka, `useState` initializer jalan dengan data terbaru — fix masalah stale state.

### Optimistic UI di CategoryManager
Update local state langsung dari return value `dbService.addCategory()`, call `onRefresh()` cuma buat sync sibling components. UI feels instant.

### CSV Excel-compatible
Pake BOM (`﻿`) di prefix biar Excel kebaca UTF-8 dengan benar (penting untuk karakter Bahasa Indonesia & Rupiah).

### Struk pembayaran yang konsisten
Struk yang dicetak saat checkout (`OrderSuccessModal`) & saat reprint dari Invoices (`ReceiptSidebar`) pakai **HTML template yang identik** — thermal-style 80mm dengan store name, info invoice, detail pesanan, breakdown PPN, status badge (LUNAS/PENDING/REFUND), dan footer. Sekali ubah desain struk, dua entry point langsung sinkron.

### Reverse-calc PPN 11%
Transaksi disimpan sebagai **grand total** (sudah include PPN), bukan subtotal. Saat tampilin di UI/struk, subtotal di-derive ulang lewat `grandTotal / 1.11`, lalu `ppn = grandTotal - subtotal`. Cara ini menghindari floating-point drift kalau kita simpan subtotal + ppn terpisah.

---

## 📜 Scripts

| Command           | Fungsi                                |
|-------------------|---------------------------------------|
| `npm run dev`     | Jalankan dev server (port 5173)       |
| `npm run build`   | Build production ke folder `dist/`    |
| `npm run preview` | Preview hasil build secara lokal      |
| `npm run lint`    | Lint dengan ESLint                    |

---

## 🚢 Deploy

Proyek ini siap deploy ke **Vercel** / **Netlify** / static hosting apapun.

**Vercel (recommended):**

1. Push repo ke GitHub
2. Import ke Vercel → auto-detect Vite
3. Set environment variables di Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

Build output: `dist/` (default Vite).

---

<div align="center">

Dibuat dengan ❤️ untuk UMKM Indonesia.

</div>
