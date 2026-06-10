# Kasirnya

Aplikasi kasir (POS) dan dashboard admin untuk usaha cafe dan retail skala kecil hingga menengah di Indonesia. Dibangun dengan React 19, TypeScript, Tailwind v4, dan Supabase. Aplikasi dapat dijalankan dalam mode demo tanpa perlu menyiapkan database terlebih dahulu.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Cara Menjalankan](#cara-menjalankan)
- [Setup Supabase](#setup-supabase)
- [Alur Penggunaan](#alur-penggunaan)
- [Role dan Akses](#role-dan-akses)
- [Struktur Proyek](#struktur-proyek)
- [Catatan Teknis](#catatan-teknis)
- [Scripts](#scripts)
- [Deploy](#deploy)

## Tentang Proyek

Kasirnya adalah aplikasi web POS yang ditujukan untuk usaha cafe dan retail skala kecil hingga menengah. Aplikasi ini menyasar pemilik usaha yang membutuhkan sistem kasir digital beserta dashboard admin, tanpa harus menyiapkan server sendiri atau berlangganan layanan SaaS berbiaya tinggi.

Beberapa karakteristik utamanya:

- **Dua mode operasi.** Bisa dijalankan dalam mode demo menggunakan localStorage tanpa Supabase, atau mode cloud dengan PostgreSQL untuk produksi.
- **Multi-store.** Setiap admin memiliki outlet sendiri. Data antar toko terisolasi melalui `store_id`.
- **Berbasis peran.** Admin memiliki akses penuh, sedangkan kasir hanya dapat mengakses POS dan Invoices.
- **Cache di sisi klien.** Navigasi antar halaman berlangsung cepat karena hasil query disimpan sementara, dan operasi tulis otomatis membatalkan cache yang relevan.
- **PPN 11%** dan format Rupiah diterapkan otomatis pada seluruh transaksi.

## Fitur Utama

### POS Cashier
Keranjang real-time, pencarian produk, filter kategori, input nama pelanggan, catatan per item, pilihan metode bayar (Cash atau QRIS), dan checkout yang langsung mencetak struk thermal 80mm. Stok produk berkurang otomatis setelah transaksi. Untuk pembayaran QRIS, modal sukses menampilkan mockup QR code.

### Catalog
Pengelolaan produk lengkap (nama, harga, kategori, stok, deskripsi) beserta manajemen kategori dengan emoji picker. Antarmuka menggunakan pola optimistic update, sehingga tampilan diperbarui lebih dulu sebelum disinkronkan ke database.

### Sales Performance
- Grafik revenue per rentang tanggal
- Kartu KPI: total revenue, jumlah transaksi, AOV, dan pertumbuhan
- Pemilih rentang tanggal kustom tanpa library eksternal
- Produk terlaris dan rincian per kategori
- Rincian subtotal dan PPN per transaksi
- Ekspor ke Excel (.xlsx) berformat, terdiri dari tiga sheet (Ringkasan, Detail Transaksi, Per Produk), dibuat dengan `exceljs`

### Invoices
Daftar transaksi beserta detail item, total, metode bayar, kasir, dan pelanggan. Struk dapat dicetak ulang kapan saja menggunakan template yang sama persis dengan struk saat checkout.

### Manage Staff
Daftar kasir per outlet, bersifat baca saja. Aplikasi tidak menyediakan pendaftaran mandiri. Akun admin dan kasir dibuat manual melalui helper SQL (lihat bagian [Setup Supabase](#setup-supabase)). Kasir masuk menggunakan email dan kata sandi.

### Multi-tenant
Setiap admin memiliki `store_id` masing-masing. Kombinasi RLS Supabase dan filter pada lapisan aplikasi memastikan data antar toko tidak saling bocor.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4, Plus Jakarta Sans |
| Ikon | Lucide React |
| Database | Supabase (PostgreSQL) untuk mode cloud |
| Fallback | localStorage untuk mode demo |
| Auth | Supabase Auth untuk admin, tabel `cashiers` (email dan kata sandi) untuk kasir, dengan satu form login |
| Compiler | React Compiler (babel-plugin-react-compiler) |
| Mobile | Capacitor 7, dibungkus menjadi APK Android |

## Cara Menjalankan

Tersedia dua cara. Pilih salah satu sesuai perangkat yang digunakan.

### Cara A: Docker

Cocok bagi yang tidak ingin memasang Node atau npm secara langsung, atau ingin lingkungan yang konsisten di berbagai perangkat. Syaratnya hanya [Docker Desktop](https://www.docker.com/products/docker-desktop/) yang sedang berjalan.

```bash
git clone https://github.com/your-username/kasir-nya.git
cd kasir-nya
docker compose up dev
```

Buka http://localhost:5173. Hot reload aktif, sehingga perubahan kode pada host langsung tercermin.

Untuk menghentikan, tekan `Ctrl+C` lalu jalankan `docker compose down`. Penjelasan lebih lengkap, termasuk mode production melalui nginx, tersedia di [DOCKER.md](./DOCKER.md).

### Cara B: Node.js

Membutuhkan [Node.js](https://nodejs.org/) versi 20 ke atas (disarankan 22 atau 24).

```bash
git clone https://github.com/your-username/kasir-nya.git
cd kasir-nya
npm install
npm run dev
```

Buka http://localhost:5173.

Pada kedua cara di atas, aplikasi langsung berjalan dalam mode demo dengan data contoh yang tersimpan di localStorage browser. Untuk menggunakan database sungguhan dengan sinkronisasi lintas perangkat, lanjutkan ke bagian [Setup Supabase](#setup-supabase).

## Setup Supabase

Langkah ini hanya diperlukan jika ingin menggunakan database cloud.

### 1. Buat project di Supabase

Daftar dan buat project baru di [supabase.com](https://supabase.com).

### 2. Salin kredensial ke file `.env`

```bash
cp .env.example .env
```

Isi berkas `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Kredensial dapat diperoleh dari Supabase Dashboard pada menu Settings, lalu API.

### 3. Jalankan schema SQL

Buka SQL Editor di Supabase, tempelkan isi berkas `supabase_schema.sql`, lalu jalankan. Tabel yang dibuat:

```
stores, profiles, products, categories, transactions, cashiers
```

Seluruh tabel menggunakan RLS dengan policy `USING (true)`. Isolasi data antar toko ditangani pada lapisan aplikasi melalui `store_id`. Berkas schema juga membuat helper function `create_admin()` dan `create_cashier()`.

### 4. Buat akun admin dan kasir

Aplikasi tidak menyediakan pendaftaran mandiri. Akun dibuat manual melalui SQL Editor:

```sql
SELECT public.create_admin('owner@tokoku.com', 1);            -- kata sandi default: admin123
SELECT public.create_cashier('Budi', 'budi@tokoku.com', 1);  -- kata sandi default: kasir123
```

Langkah lengkapnya mengikuti blok komentar GETTING STARTED di bagian bawah `supabase_schema.sql`.

### 5. Jalankan ulang dev server

```bash
npm run dev
```

Aplikasi kini terhubung ke Supabase. Masuk menggunakan akun yang baru dibuat.

## Alur Penggunaan

### Mode Demo

Buka aplikasi, lalu langsung gunakan seluruh fitur. Data tersimpan di localStorage browser.

### Mode Cloud

```
1. Buat akun admin dan kasir melalui helper SQL (lihat Setup Supabase)
2. Masuk menggunakan email dan kata sandi pada satu form login
3. Tambahkan produk dan kategori di halaman Catalog
4. Lihat daftar kasir di halaman Manage Staff (baca saja)
5. Kasir masuk menggunakan email dan kata sandi
```

### Alur Transaksi

```
Login (admin atau kasir)
  -> POS Cashier: pilih produk, input nama pelanggan
  -> Checkout: pilih metode bayar (Cash atau QRIS)
  -> Struk tersimpan otomatis di Invoices
  -> Stok produk berkurang otomatis
  -> Dashboard dan Sales Performance ikut diperbarui
```

## Role dan Akses

| Halaman | Admin | Kasir |
|---|:---:|:---:|
| Dashboard | Ya | - |
| POS Cashier | Ya | Ya |
| Invoices | Ya | Ya |
| Catalog | Ya | - |
| Sales Performance | Ya | - |
| Manage Staff | Ya | - |
| Profile | Ya | Ya |
| Help Center | Ya | Ya |

## Struktur Proyek

```
src/
  api/              Lapisan service domain (auth, products, categories, dll)
  components/
    layout/         Navbar, Sidebar, MainLayout
    modal/          Modal (Add/Edit Product, Sign Out, dll)
    ui/             Komponen reusable (Button, Card, Badge, ...)
  pages/
    admin/          Dashboard, Catalog, Sales, Staff, Profile
    shared/         POS, Invoices, Help (admin dan kasir)
    auth/           Login, Forgot Password, Reset Password
  sections/         Section UI per halaman
    pos/            POSSection, ProductGrid, CartDrawer
    catalog/        CatalogSection, CategoryManager, CatalogGrid, CatalogTable
    sales/          SalesSection, KPIOverview, RevenueChart, CategoryDonut,
                    DateRangePicker, SalesTable, TopProductsTable
    invoices/       InvoicesSection, InvoicesTable, ReceiptSidebar
    dashboard/      StatsGrid, RecentActivity
    staff/          StaffSection
    profile/        ProfileSection
    help/           HelpSection
  hooks/            Custom hooks (useStoreData)
  lib/              Helper (format Rupiah, barrel re-export dari api/)
```

## Catatan Teknis

Beberapa pola yang digunakan pada proyek ini.

### Cache dengan TTL dan persistensi localStorage
`src/api/cache.ts` menyediakan helper `fromCache`, `toCache`, dan `bustCache` dengan TTL 10 menit dan persistensi ke localStorage. Setiap getter memeriksa cache terlebih dahulu, sehingga navigasi maupun refresh halaman terasa cepat. Operasi tulis otomatis membatalkan cache yang terkait.

### Throw saat Supabase error
Operasi tulis tidak diam-diam beralih ke localStorage. Jika Supabase mengembalikan error, aplikasi langsung melempar error. Pendekatan ini mencegah data yang seolah tersimpan di lokal tetapi sebenarnya tidak masuk ke database.

### Pola refreshTrigger
Komponen induk menaikkan penghitung integer, lalu komponen anak melakukan fetch ulang melalui `useEffect([storeId, refreshTrigger])`. Pola sederhana untuk menyinkronkan komponen yang bersebelahan. Pola ini dirangkum pada hook `useStoreData`.

### Rendering modal kondisional
```tsx
{isAddOpen && <AddProductModal ... />}
{isEditOpen && selectedProduct && <EditProductModal ... />}
```
Modal dipasang ulang setiap kali dibuka, sehingga inisialisasi `useState` selalu menggunakan data terbaru dan terhindar dari masalah stale state.

### Optimistic update di CategoryManager
State lokal diperbarui langsung dari nilai kembalian `dbService.addCategory()`, sementara `onRefresh()` dipanggil hanya untuk menyinkronkan komponen lain. Tampilan terasa responsif.

### Ekspor Excel (.xlsx)
Tombol Unduh Excel pada halaman Sales menghasilkan berkas `.xlsx` berformat menggunakan `exceljs`, yang dimuat secara lazy agar bundle utama tetap ringkas. Berkas menggunakan numFmt asli (`"Rp"#,##0`), auto-filter, dan freeze pane, sehingga data dapat langsung diolah lebih lanjut.

### Struk yang konsisten
Struk yang dicetak saat checkout (`OrderSuccessModal`) dan saat cetak ulang dari Invoices (`ReceiptSidebar`) menggunakan template HTML yang identik, bergaya thermal 80mm. Perubahan desain struk cukup dilakukan satu kali untuk berlaku pada kedua titik cetak.

### Perhitungan balik PPN 11%
Transaksi disimpan sebagai grand total yang sudah termasuk PPN, bukan subtotal. Saat ditampilkan, subtotal dihitung ulang melalui `grandTotal / 1.11`, lalu `ppn = grandTotal - subtotal`. Cara ini menghindari floating-point drift yang dapat terjadi bila subtotal dan PPN disimpan terpisah.

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan dev server pada port 5173 |
| `npm run build` | Membangun versi production ke folder `dist/` |
| `npm run preview` | Meninjau hasil build secara lokal |
| `npm run lint` | Menjalankan ESLint |
| `docker compose up dev` | Menjalankan via Docker dengan hot reload pada port 5173 |
| `docker compose --profile prod up --build prod` | Build dan menyajikan via nginx pada port 8080 |

## Deploy

Proyek ini dapat di-deploy ke Vercel, Netlify, atau layanan static hosting lainnya. Untuk Vercel:

1. Push repo ke GitHub.
2. Impor ke Vercel. Konfigurasi Vite akan terdeteksi otomatis.
3. Atur environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di dashboard Vercel.
4. Deploy.

Output build berada di folder `dist/`.
