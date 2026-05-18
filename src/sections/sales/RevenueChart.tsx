import { BarChart2 } from 'lucide-react';
import type { ChartPoint } from './SalesSection';

interface Props {
  data: ChartPoint[];
  timeRange: 'Today' | '7D' | '30D' | 'Custom';
}

const shortIDR = (n: number): string => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
};

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function RevenueChart({ data, timeRange }: Props) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  const totalAmount = data.reduce((s, d) => s + d.amount, 0);
  const hasData = totalAmount > 0;

  // Y-axis guide lines (4 levels)
  const yLevels = [1, 0.75, 0.5, 0.25];

  // Skip labels when there are many bars to avoid crowding
  const shouldShowLabel = (i: number, total: number) => {
    if (timeRange === 'Today') return i % 4 === 0;
    if (total > 14) return i % Math.ceil(total / 8) === 0;
    return true;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[340px]">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Pendapatan</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Total: <span className="font-bold text-slate-600">{fmtIDR(totalAmount)}</span>
          </p>
        </div>
        <div className="h-8 w-8 bg-indigo-50 rounded-xl flex items-center justify-center">
          <BarChart2 className="h-4 w-4 text-indigo-500" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <BarChart2 className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada transaksi</p>
          <p className="text-[10px] text-slate-300 font-medium mt-1">Data akan muncul setelah ada penjualan</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chart area */}
          <div className="flex flex-1 gap-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between pb-6 pr-2 shrink-0">
              {yLevels.map((lvl, i) => (
                <span key={i} className="text-[9px] font-bold text-slate-300 leading-none">
                  {shortIDR(maxAmount * lvl)}
                </span>
              ))}
            </div>

            {/* Bars + grid */}
            <div className="flex-1 flex flex-col">
              {/* Grid lines + bars */}
              <div className="flex-1 relative">
                {/* Horizontal grid lines */}
                {yLevels.map((lvl, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                    style={{ top: `${(1 - lvl) * 100}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-1 pb-0">
                  {data.map((d, i) => {
                    const pct = Math.max((d.amount / maxAmount) * 100, d.amount > 0 ? 2 : 0);
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                        {/* Tooltip */}
                        {d.amount > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none select-none whitespace-nowrap z-10 shadow-lg">
                            {shortIDR(d.amount)}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                          </div>
                        )}
                        {/* Bar */}
                        <div
                          className="w-full rounded-t-[3px] transition-all duration-500"
                          style={{
                            height: `${pct}%`,
                            background: d.amount > 0
                              ? 'linear-gradient(to top, #6366f1, #8b5cf6)'
                              : '#f1f5f9',
                            opacity: d.amount > 0 ? 1 : 0.4,
                          }}
                          onMouseEnter={e => {
                            if (d.amount > 0)
                              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to top, #4f46e5, #7c3aed)';
                          }}
                          onMouseLeave={e => {
                            if (d.amount > 0)
                              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(to top, #6366f1, #8b5cf6)';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex gap-1 mt-2 h-5">
                {data.map((d, i) => (
                  <div key={i} className="flex-1 flex justify-center">
                    {shouldShowLabel(i, data.length) && (
                      <span className="text-[8px] font-bold text-slate-300 leading-none truncate text-center">
                        {d.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
