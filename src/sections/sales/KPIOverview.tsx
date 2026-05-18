import { Wallet, ShoppingBag, BarChart3, Users } from 'lucide-react';
import type { Transaction, Customer } from '../../lib/db';

interface Props {
  transactions: Transaction[];
  customers: Customer[];
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function KPIOverview({ transactions, customers }: Props) {
  const totalRevenue = transactions.reduce((s, tx) => s + Number(tx.total_amount), 0);
  const totalOrders  = transactions.length;
  const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const metrics = [
    {
      title: 'Total Pendapatan',
      value: fmtIDR(Math.round(totalRevenue)),
      sub: `${totalOrders} transaksi`,
      icon: Wallet,
      gradient: 'from-indigo-500 to-violet-600',
      light: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Jumlah Pesanan',
      value: totalOrders.toLocaleString('id-ID'),
      sub: totalOrders === 0 ? 'Belum ada transaksi' : 'total transaksi',
      icon: ShoppingBag,
      gradient: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Rata-rata Pesanan',
      value: fmtIDR(Math.round(avgOrder)),
      sub: 'per transaksi',
      icon: BarChart3,
      gradient: 'from-amber-500 to-orange-500',
      light: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total Member',
      value: customers.length.toLocaleString('id-ID'),
      sub: 'pelanggan terdaftar',
      icon: Users,
      gradient: 'from-rose-500 to-pink-600',
      light: 'bg-rose-50 text-rose-600',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div
            key={i}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-3 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{m.title}</span>
              <p className="font-extrabold text-slate-800 text-lg mt-1.5 leading-tight truncate">{m.value}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">{m.sub}</span>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${m.gradient}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
