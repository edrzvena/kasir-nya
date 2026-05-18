import { Trophy, Package } from 'lucide-react';
import type { TopProductRow } from './SalesSection';

interface Props {
  data: TopProductRow[];
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const RANK_STYLES = [
  'bg-amber-50  text-amber-600  border-amber-200',  // 1st
  'bg-slate-100 text-slate-500  border-slate-200',  // 2nd
  'bg-orange-50 text-orange-500 border-orange-200', // 3rd
];

export default function TopProductsTable({ data }: Props) {
  const maxSold = data.length > 0 ? data[0].sold : 1; // data is pre-sorted desc

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-2">
        <div className="h-7 w-7 bg-amber-50 rounded-lg flex items-center justify-center">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Produk Terlaris</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Berdasarkan jumlah unit terjual</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <Package className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada data penjualan</p>
          <p className="text-[10px] text-slate-300 font-medium mt-1">
            Data produk terlaris akan muncul setelah ada transaksi
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[540px]">
            <thead>
              <tr className="bg-slate-50/60 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3">#</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Terjual</th>
                <th className="px-4 py-3">Omset</th>
                <th className="px-6 py-3">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row) => {
                const volumePct = Math.round((row.sold / maxSold) * 100);
                const rankStyle = RANK_STYLES[row.rank - 1] ?? 'bg-slate-50 text-slate-400 border-slate-100';

                return (
                  <tr key={row.rank} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <span className={`h-6 w-6 rounded-lg border text-[10px] font-extrabold flex items-center justify-center ${rankStyle}`}>
                        {row.rank}
                      </span>
                    </td>

                    {/* Product name + image */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {row.img ? (
                          <img
                            src={row.img}
                            alt={row.name}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                        {row.category}
                      </span>
                    </td>

                    {/* Units sold */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-extrabold text-slate-800">{row.sold}</span>
                      <span className="text-[9px] text-slate-400 font-medium ml-1">unit</span>
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-slate-700">{fmtIDR(row.revenue)}</span>
                    </td>

                    {/* Volume bar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                            style={{ width: `${volumePct}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 w-7 text-right">{volumePct}%</span>
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
