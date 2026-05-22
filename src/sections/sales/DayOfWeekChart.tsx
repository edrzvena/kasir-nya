import { CalendarDays } from 'lucide-react';
import type { Transaction } from '../../lib/db';

interface Props {
  transactions: Transaction[];
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function DayOfWeekChart({ transactions }: Props) {
  const buckets = Array.from({ length: 7 }, () => ({ revenue: 0, count: 0 }));

  transactions.forEach(tx => {
    if (!tx.created_at) return;
    const d = new Date(tx.created_at).getDay();
    buckets[d].revenue += Number(tx.total_amount);
    buckets[d].count += 1;
  });

  const maxRev = Math.max(...buckets.map(b => b.revenue), 1);
  const peakDay = buckets.reduce<{ revenue: number; count: number; day: number }>(
    (acc, b, i) => b.revenue > acc.revenue ? { revenue: b.revenue, count: b.count, day: i } : acc,
    { revenue: 0, count: 0, day: -1 }
  );
  const hasData = transactions.length > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[340px]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Per Hari</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Pendapatan berdasarkan hari</p>
        </div>
        <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center">
          <CalendarDays className="h-4 w-4 text-emerald-500" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada data</p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-end gap-2 min-h-[180px] pb-2">
            {buckets.map((b, d) => {
              const pct = (b.revenue / maxRev) * 100;
              const isPeak = d === peakDay.day;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full h-full flex flex-col-reverse">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                          : b.revenue > 0
                            ? 'bg-gradient-to-t from-indigo-400 to-violet-400 group-hover:from-indigo-500 group-hover:to-violet-500'
                            : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(pct, b.revenue > 0 ? 4 : 0)}%` }}
                      title={`${DAYS[d]} — ${fmtIDR(Math.round(b.revenue))} (${b.count} tx)`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isPeak ? 'text-emerald-600' : 'text-slate-400'}`}>{DAYS[d]}</span>
                </div>
              );
            })}
          </div>

          {peakDay.day >= 0 && (
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Tersibuk</span>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                  {DAYS[peakDay.day]}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{fmtIDR(Math.round(peakDay.revenue))}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
