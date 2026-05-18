import { PieChart } from 'lucide-react';
import type { CategoryPoint } from './SalesSection';

interface Props {
  data: CategoryPoint[];
  totalOrders: number;
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function CategoryDonut({ data, totalOrders }: Props) {
  const hasData = data.length > 0 && data.some(d => d.amount > 0);

  // Build conic-gradient string from real percentages
  const gradient = (() => {
    if (!hasData) return 'conic-gradient(#e2e8f0 0% 100%)';
    let cum = 0;
    const parts = data.map(cat => {
      const start = cum;
      const end   = cum + cat.pct;
      cum = end;
      return `${cat.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
    });
    // Fill remainder if pcts don't sum to 100 due to rounding
    if (cum < 100) parts.push(`${data[data.length - 1].color} ${cum}% 100%`);
    return `conic-gradient(${parts.join(', ')})`;
  })();

  const totalRevenue = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[340px]">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Per Kategori</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Distribusi penjualan</p>
        </div>
        <div className="h-8 w-8 bg-violet-50 rounded-xl flex items-center justify-center">
          <PieChart className="h-4 w-4 text-violet-500" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <PieChart className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada data</p>
          <p className="text-[10px] text-slate-300 font-medium mt-1">Mulai jual produk untuk melihat distribusi</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Donut */}
          <div className="flex justify-center items-center py-3">
            <div
              className="h-36 w-36 rounded-full flex items-center justify-center relative"
              style={{ background: gradient }}
            >
              {/* Inner white ring */}
              <div className="h-[88px] w-[88px] bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="font-extrabold text-slate-800 text-xl leading-none">
                  {totalOrders}
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  transaksi
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-2">
            {data.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-xs font-semibold text-slate-600 truncate">{cat.name}</span>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-800 block leading-tight">
                    {cat.pct}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium block">
                    {fmtIDR(cat.amount)}
                  </span>
                </div>
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-[9px] text-slate-400 font-medium pt-1">
                +{data.length - 5} kategori lainnya
              </p>
            )}
          </div>

          {/* Total */}
          <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Omset</span>
            <span className="text-xs font-extrabold text-slate-800">{fmtIDR(totalRevenue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
