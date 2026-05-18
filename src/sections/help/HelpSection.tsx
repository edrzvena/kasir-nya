import { ShoppingCart, Package, BarChart3, UserPlus, HelpCircle, BookOpen, ReceiptText } from 'lucide-react';

type Role = 'admin' | 'cashier';

const guides = [
  {
    icon: ShoppingCart,
    title: 'Proses Transaksi',
    desc: 'Buka halaman POS Cashier, pilih produk yang dipesan, masukkan nama pelanggan, pilih metode pembayaran, lalu klik Checkout. Struk otomatis tercatat di Invoices.',
    roles: ['admin', 'cashier'] as Role[]
  },
  {
    icon: ReceiptText,
    title: 'Lihat Riwayat Struk',
    desc: 'Semua transaksi yang sudah diproses tersimpan di halaman Invoices. Klik salah satu transaksi untuk melihat detail struk lengkap beserta item dan metode pembayaran.',
    roles: ['admin', 'cashier'] as Role[]
  },
  {
    icon: Package,
    title: 'Kelola Produk',
    desc: 'Di halaman Catalog, klik tombol Tambah Produk untuk menambah item baru. Klik ikon edit pada produk untuk mengubah harga, stok, atau foto. Produk yang habis otomatis ditandai Out of Stock.',
    roles: ['admin'] as Role[]
  },
  {
    icon: BarChart3,
    title: 'Lihat Laporan Penjualan',
    desc: 'Halaman Sales Performance menampilkan grafik revenue, total transaksi, dan produk terlaris. Gunakan filter tanggal untuk melihat periode tertentu, atau unduh laporan lewat tombol Export CSV.',
    roles: ['admin'] as Role[]
  },
  {
    icon: UserPlus,
    title: 'Kelola Kasir',
    desc: 'Di halaman Manage Staff, tambahkan akun kasir dengan username dan PIN. Kasir login menggunakan email admin toko, username, dan PIN mereka — tanpa perlu akses ke akun admin.',
    roles: ['admin'] as Role[]
  }
];

const faqs = [
  {
    q: 'Stok produk berkurang otomatis setelah transaksi?',
    a: 'Ya. Setiap kali transaksi berhasil diproses di POS, stok setiap item yang terjual akan otomatis berkurang. Jika stok mencapai 5 atau kurang, status berubah menjadi Low Stock.',
    roles: ['admin', 'cashier'] as Role[]
  },
  {
    q: 'Di mana melihat riwayat semua transaksi?',
    a: 'Semua transaksi tersimpan di halaman Invoices. Klik salah satu transaksi untuk melihat detail struk lengkap beserta item yang dibeli dan metode pembayaran.',
    roles: ['admin', 'cashier'] as Role[]
  },
  {
    q: 'Halaman apa saja yang bisa diakses kasir?',
    a: 'Kasir hanya bisa mengakses POS Cashier dan Invoices. Halaman lain seperti Dashboard, Catalog, Sales, Staff, dan Profile hanya tersedia untuk Admin.',
    roles: ['cashier'] as Role[]
  },
  {
    q: 'Bagaimana cara mengubah foto dan nama toko?',
    a: 'Buka halaman Profile, klik foto profil untuk mengunggah gambar baru. Nama toko dan informasi outlet dapat diubah di halaman yang sama.',
    roles: ['admin'] as Role[]
  },
  {
    q: 'Kasir bisa akses halaman admin?',
    a: 'Tidak. Akun kasir hanya bisa mengakses POS Cashier dan Invoices. Semua halaman manajemen hanya bisa diakses oleh Admin.',
    roles: ['admin'] as Role[]
  },
  {
    q: 'Bagaimana cara reset password?',
    a: 'Di halaman login, klik Lupa Password pada tab Admin Login. Masukkan email admin dan link reset password akan dikirim ke email tersebut.',
    roles: ['admin'] as Role[]
  }
];

interface HelpSectionProps {
  role: Role;
}

export default function HelpSection({ role }: HelpSectionProps) {
  const visibleGuides = guides.filter(g => g.roles.includes(role));
  const visibleFaqs   = faqs.filter(f => f.roles.includes(role));

  return (
    <div className="max-w-3xl space-y-6 animate-fadeIn pb-12">

      {/* Header */}
      <div>
        <h2 className="font-extrabold text-slate-800 text-xl leading-none">Pusat Bantuan</h2>
        <p className="text-slate-400 text-xs mt-1.5 font-medium">
          {role === 'cashier'
            ? 'Panduan penggunaan aplikasi kasir untuk kegiatan transaksi sehari-hari.'
            : 'Panduan singkat penggunaan aplikasi kasir untuk admin dan kasir toko.'}
        </p>
      </div>

      {/* Guide cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleGuides.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex gap-4 group hover:border-indigo-100 hover:shadow-md hover:shadow-slate-100/50 transition-all duration-300"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs leading-snug">{g.title}</h4>
                <p className="text-slate-400 text-[10px] leading-relaxed mt-1.5 font-medium">{g.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
        <h4 className="font-bold text-slate-800 text-sm leading-none flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <span>Pertanyaan yang Sering Ditanyakan</span>
        </h4>

        <div className="divide-y divide-slate-50">
          {visibleFaqs.map((f, idx) => (
            <div key={idx} className="pt-4 first:pt-0">
              <h5 className="font-bold text-xs text-slate-800 flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                {f.q}
              </h5>
              <p className="text-slate-400 text-[10px] leading-relaxed mt-1.5 font-medium pl-5">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
