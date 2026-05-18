import { useState, useEffect } from 'react';
import { ShoppingBag, Banknote, UserCheck, TrendingUp } from 'lucide-react';
import { dbService, authService } from '../../lib/db';
import type { Transaction, Cashier } from '../../lib/db';

interface StatsGridProps {
  storeId: number;
  refreshTrigger: number;
}

export default function StatsGrid({ storeId, refreshTrigger }: StatsGridProps) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [txData, staffData] = await Promise.all([
        dbService.getTransactions(storeId),
        authService.getCashiers(storeId),
      ]);
      setTxs(txData);
      setCashiers(staffData);
    };
    fetchStats();
  }, [storeId, refreshTrigger]);

  // Sum total income
  const totalIncome = txs.reduce((sum, t) => sum + t.total_amount, 0);
  
  // Format Currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const avgOrderValue = txs.length > 0 ? totalIncome / txs.length : 0;

  const statCards = [
    {
      title: "Total Pendapatan",
      value: formatIDR(totalIncome),
      desc: "Total dari semua invoice tercatat",
      icon: Banknote,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100/50"
    },
    {
      title: "Total Transaksi",
      value: txs.length.toString(),
      desc: "Jumlah order masuk",
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100/50"
    },
    {
      title: "Rata-rata per Order",
      value: formatIDR(avgOrderValue),
      desc: "Nilai rata-rata tiap transaksi",
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 border-amber-100/50"
    },
    {
      title: "Kasir Aktif",
      value: cashiers.length.toString(),
      desc: "Kasir terdaftar di outlet ini",
      icon: UserCheck,
      color: "text-sky-600 bg-sky-50 border-sky-100/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
      {statCards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{c.title}</span>
              <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{c.value}</h3>
              <p className="text-[9px] font-medium text-slate-400 leading-none">{c.desc}</p>
            </div>
            
            <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 ${c.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
