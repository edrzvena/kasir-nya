import { UserCheck, Crown } from 'lucide-react';
import type { Transaction } from '../../lib/db';

interface Props {
  transactions: Transaction[];
}

interface CashierRow {
  name: string;
  count: number;
  revenue: number;
  avg: number;
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function CashierPerformanceTable({ transactions }: Props) {
  const map = new Map<string, { count: number; revenue: number }>();

  transactions.forEach(tx => {
    const name = tx.cashier_name?.trim() || 'Tidak diketahui';
    const prev = map.get(name) ?? { count: 0, revenue: 0 };
    map.set(name, {
      count: prev.count + 1,
      revenue: prev.revenue + Number(tx.total_amount),
    });
  });

  const rows: CashierRow[] = [...map.entries()]
    .map(([name, v]) => ({
      name,
      count: v.count,
      revenue: v.revenue,
      avg: v.count > 0 ? v.revenue / v.count : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const maxRev = rows[0]?.revenue ?? 1;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Performa Kasir</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Ranking kasir berdasarkan pendapatan</p>
        </div>
        <div className="h-8 w-8 bg-violet-50 rounded-xl flex items-center justify-center">
          <UserCheck className="h-4 w-4 text-violet-500" />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs font-bold text-slate-400">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Nama Kasir</th>
                <th className="px-2 py-2 text-right">Transaksi</th>
                <th className="px-2 py-2 text-right">Rata-rata</th>
                <th className="px-2 py-2 text-right">Total Pendapatan</th>
                <th className="px-2 py-2 w-24">Kontribusi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pct = (r.revenue / maxRev) * 100;
                return (
                  <tr key={r.name} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-2 py-3">
                      {i === 0 ? (
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <span className="text-slate-400 font-bold text-[10px]">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className="font-bold text-slate-800 text-xs">{r.name}</span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span className="font-bold text-slate-700">{r.count}</span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span className="text-slate-500 font-semibold">{fmtIDR(Math.round(r.avg))}</span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span className="font-extrabold text-slate-800">{fmtIDR(Math.round(r.revenue))}</span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-indigo-400 to-violet-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
