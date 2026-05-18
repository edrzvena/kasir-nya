# Kasirnya — POS & Admin Dashboard

Aplikasi kasir (Point of Sale) berbasis web untuk bisnis cafe dan retail. Dilengkapi dashboard admin, manajemen produk, laporan penjualan, dan manajemen staff kasir.

## Fitur

- **POS Cashier** — Proses transaksi, keranjang belanja, checkout dengan PPN 10%, struk otomatis
- **Admin Catalog** — CRUD produk & kategori dengan emoji picker
- **Sales Performance** — Grafik revenue, KPI, filter rentang tanggal, export CSV
- **Manage Staff** — Buat & kelola akun kasir per outlet
- **Multi-store** — Setiap admin punya `store_id` sendiri, data terisolasi antar outlet
- **Role-based Access** — Admin akses penuh, kasir hanya POS & Invoices
- **Dual Mode** — Supabase (cloud) sebagai primary DB, localStorage sebagai fallback/demo mode

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (PostgreSQL)
- Lucide React (icons)
- Plus Jakarta Sans (font)

## Struktur Proyek

```
src/
├── api/              # Domain service layer (auth, products, categories, dll)
├── components/
│   ├── layout/       # Navbar, Sidebar, MainLayout
│   ├── modal/        # Modal komponen (produk, sign out, dll)
│   └── ui/           # Komponen reusable (Button, Card, Badge, dll)
├── pages/
│   ├── admin/        # Dashboard, Catalog, Sales, Staff, Profile
│   ├── shared/       # POS, Invoices, Help (admin + kasir)
│   └── auth/         # Login, Register, ForgotPassword, ResetPassword
├── sections/         # Section komponen per halaman
│   ├── pos/
│   ├── catalog/
│   ├── sales/
│   ├── invoices/
│   ├── dashboard/
│   ├── staff/
│   ├── profile/
│   └── help/
└── lib/
    └── db.ts         # Re-export barrel dari src/api/
```

## Cara Menjalankan

### 1. Clone & Install

```bash
git clone https://github.com/username/kasir-nya.git
cd kasir-nya
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Isi `.env` dengan kredensial Supabase kamu:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> Kalau tidak punya Supabase, app tetap bisa jalan dalam **demo mode** menggunakan localStorage — tidak perlu konfigurasi apapun.

### 3. Setup Database (opsional, untuk mode cloud)

Jalankan `supabase_schema.sql` di Supabase SQL Editor untuk membuat tabel dan sample data.

Tabel yang dibuat: `stores`, `profiles`, `products`, `categories`, `customers`, `transactions`, `cashiers`

### 4. Jalankan Dev Server

```bash
npm run dev
```

Buka `http://localhost:5173`

## Alur Penggunaan

### Mode Demo (tanpa Supabase)

Langsung buka app — data sample sudah tersedia otomatis di localStorage. Dua toko demo tersedia: **Cafe Boy** dan **Cafe Girl**.

### Mode Cloud (dengan Supabase)

1. Register akun admin baru via tab **Register**
2. Login sebagai admin
3. Tambahkan produk di halaman **Catalog**
4. Buat akun kasir di halaman **Manage Staff**
5. Kasir login via tab **Cashier PIN** menggunakan email admin, username, dan PIN

### Alur Transaksi

```
Login (Admin/Kasir)
  → POS Cashier (pilih produk, input nama pelanggan)
  → Checkout (pilih metode bayar: Cash / QRIS / Debit / Kredit)
  → Struk tersimpan otomatis di Invoices
  → Stok produk berkurang otomatis
  → Stats Dashboard terupdate
```

## Role & Akses

| Halaman | Admin | Kasir |
|---|---|---|
| Dashboard | ✓ | — |
| POS Cashier | ✓ | ✓ |
| Invoices | ✓ | ✓ |
| Catalog | ✓ | — |
| Sales Performance | ✓ | — |
| Manage Staff | ✓ | — |
| Profile | ✓ | ✓ |
| Help Center | ✓ | ✓ |

## Build Production

```bash
npm run build
```

Output di folder `dist/`.
