import { Clock } from 'lucide-react';
import type { Transaction } from '../../lib/db';

interface Props {
  transactions: Transaction[];
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function PeakHoursChart({ transactions }: Props) {
  const buckets = Array.from({ length: 24 }, () => ({ revenue: 0, count: 0 }));

  transactions.forEach(tx => {
    if (!tx.created_at) return;
    const h = new Date(tx.created_at).getHours();
    buckets[h].revenue += Number(tx.total_amount);
    buckets[h].count += 1;
  });

  const maxRev = Math.max(...buckets.map(b => b.revenue), 1);
  const peakHour = buckets.reduce<{ revenue: number; count: number; hour: number }>(
    (acc, b, i) => b.count > acc.count ? { revenue: b.revenue, count: b.count, hour: i } : acc,
    { revenue: 0, count: 0, hour: -1 }
  );
  const hasData = transactions.length > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[340px]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Jam Ramai</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Pendapatan per jam (00:00 – 23:00)</p>
        </div>
        <div className="h-8 w-8 bg-amber-50 rounded-xl flex items-center justify-center">
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada data</p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-end gap-0.5 min-h-[180px] pb-2">
            {buckets.map((b, h) => {
              const pct = (b.revenue / maxRev) * 100;
              const isPeak = h === peakHour.hour;
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full h-full flex flex-col-reverse">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                          : b.revenue > 0
                            ? 'bg-gradient-to-t from-indigo-400 to-violet-400 group-hover:from-indigo-500 group-hover:to-violet-500'
                            : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(pct, b.revenue > 0 ? 3 : 0)}%` }}
                      title={`${String(h).padStart(2, '0')}:00 — ${fmtIDR(Math.round(b.revenue))} (${b.count} tx)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1 px-0.5">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>

          {peakHour.hour >= 0 && (
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Tersibuk</span>
              <div className="flex items-center gap-2">
                <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono">
                  {String(peakHour.hour).padStart(2, '0')}:00
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{peakHour.count} tx</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
