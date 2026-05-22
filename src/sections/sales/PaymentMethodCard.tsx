import { CreditCard, Banknote, QrCode } from 'lucide-react';
import type { Transaction } from '../../lib/db';
import { fmtIDR } from '../../lib/format';

interface Props {
  transactions: Transaction[];
}

const METHODS = [
  { id: 'Cash', label: 'Tunai', icon: Banknote, color: '#10b981', light: 'bg-emerald-50 text-emerald-600' },
  { id: 'QRIS', label: 'QRIS', icon: QrCode, color: '#6366f1', light: 'bg-indigo-50 text-indigo-600' },
] as const;

export default function PaymentMethodCard({ transactions }: Props) {
  const totalRevenue = transactions.reduce((s, t) => s + Number(t.total_amount), 0);

  const stats = METHODS.map(m => {
    const txs = transactions.filter(t => t.payment_method === m.id);
    const revenue = txs.reduce((s, t) => s + Number(t.total_amount), 0);
    const pct = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    return { ...m, count: txs.length, revenue, pct };
  });

  const hasData = totalRevenue > 0;

  const gradient = (() => {
    if (!hasData) return 'conic-gradient(#e2e8f0 0% 100%)';
    let cum = 0;
    const parts = stats.map(s => {
      const start = cum;
      const end = cum + s.pct;
      cum = end;
      return `${s.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
    });
    if (cum < 100) parts.push(`#e2e8f0 ${cum}% 100%`);
    return `conic-gradient(${parts.join(', ')})`;
  })();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[340px]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Per Metode Bayar</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Distribusi Tunai vs QRIS</p>
        </div>
        <div className="h-8 w-8 bg-indigo-50 rounded-xl flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-indigo-500" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-center items-center py-3">
            <div
              className="h-36 w-36 rounded-full flex items-center justify-center relative"
              style={{ background: gradient }}
            >
              <div className="h-[88px] w-[88px] bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="font-extrabold text-slate-800 text-xl leading-none">
                  {transactions.length}
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  transaksi
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-4 py-3 mt-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Total Omset</span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5">Semua metode</span>
            </div>
            <span className="font-extrabold text-slate-800 text-base leading-none break-all text-right">
              {fmtIDR(totalRevenue)}
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg ${s.light} flex items-center justify-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{s.label}</span>
                      <span className="text-[10px] font-extrabold text-slate-800">{s.pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">{s.count} transaksi</span>
                      <span className="text-[10px] text-slate-500 font-bold">{fmtIDR(Math.round(s.revenue))}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
