import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Transaction } from '../../lib/db';

interface Props {
  currentPeriod: Transaction[];
  previousPeriod: Transaction[];
  rangeLabel: string;
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

function calcGrowth(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export default function PeriodComparison({ currentPeriod, previousPeriod, rangeLabel }: Props) {
  const curRevenue = currentPeriod.reduce((s, t) => s + Number(t.total_amount), 0);
  const prevRevenue = previousPeriod.reduce((s, t) => s + Number(t.total_amount), 0);
  const curOrders = currentPeriod.length;
  const prevOrders = previousPeriod.length;
  const curAvg = curOrders > 0 ? curRevenue / curOrders : 0;
  const prevAvg = prevOrders > 0 ? prevRevenue / prevOrders : 0;

  const metrics = [
    { label: 'Pendapatan', current: fmtIDR(Math.round(curRevenue)), growth: calcGrowth(curRevenue, prevRevenue) },
    { label: 'Pesanan', current: curOrders.toLocaleString('id-ID'), growth: calcGrowth(curOrders, prevOrders) },
    { label: 'Rata-rata Pesanan', current: fmtIDR(Math.round(curAvg)), growth: calcGrowth(curAvg, prevAvg) },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Perbandingan Periode</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            {rangeLabel} vs periode sebelumnya
          </p>
        </div>
        <div className="h-8 w-8 bg-indigo-50 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const isPositive = m.growth !== null && m.growth > 0;
          const isNegative = m.growth !== null && m.growth < 0;
          const isFlat = m.growth === 0 || m.growth === null;

          const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
          const badgeClass = isPositive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : isNegative
              ? 'bg-rose-50 text-rose-700 border-rose-100'
              : 'bg-slate-50 text-slate-500 border-slate-100';

          return (
            <div key={i} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{m.label}</span>
              <p className="font-extrabold text-slate-800 text-base mt-1.5 leading-tight">{m.current}</p>
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${badgeClass}`}>
                <Icon className="h-3 w-3" />
                <span>
                  {isFlat
                    ? 'Tidak ada perubahan'
                    : `${m.growth! > 0 ? '+' : ''}${m.growth!.toFixed(1)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
