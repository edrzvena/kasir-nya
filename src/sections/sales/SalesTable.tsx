import { ClipboardList, Receipt } from 'lucide-react';
import type { Transaction } from '../../lib/db';

interface Props {
  transactions: Transaction[];
}

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const METHOD_STYLES: Record<string, string> = {
  Cash: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  QRIS: 'bg-violet-50  text-violet-600  border-violet-200',
};

export default function SalesTable({ transactions }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-2">
        <div className="h-7 w-7 bg-indigo-50 rounded-lg flex items-center justify-center">
          <ClipboardList className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-none">Daftar Penjualan</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {transactions.length} transaksi dalam periode ini
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <Receipt className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-xs font-bold text-slate-400">Belum ada transaksi</p>
          <p className="text-[10px] text-slate-300 font-medium mt-1">
            Data akan muncul setelah ada penjualan pada periode ini
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/60 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3">No. Order</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Kasir</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">PPN (11%)</th>
                <th className="px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => {
                const subtotalBeforeTax = tx.items.reduce((s, it) => s + it.price * it.quantity, 0);
                const ppn = subtotalBeforeTax * 0.11;
                const methodStyle = METHOD_STYLES[tx.payment_method] ?? 'bg-slate-50 text-slate-500 border-slate-200';
                const dt = tx.created_at ? fmtDate(tx.created_at) : { date: '—', time: '' };

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors group">

                    {/* Order ID */}
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-extrabold text-indigo-600 font-mono tracking-tight">
                        {tx.order_id}
                      </span>
                    </td>

                    {/* Datetime */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-slate-700 block leading-tight">{dt.date}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{dt.time}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-slate-700 leading-tight">{tx.customer_name}</span>
                    </td>

                    {/* Cashier */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500 font-medium">
                        {tx.cashier_name || '—'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${methodStyle}`}>
                        {tx.payment_method}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <div className="space-y-0.5">
                        {tx.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-1 leading-tight">
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">{item.quantity}×</span>
                            <span className="text-[10px] font-semibold text-slate-600 truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        {tx.items.map((item, i) => (
                          <div key={i} className="leading-tight">
                            <span className="text-[10px] font-semibold text-slate-500">
                              {item.category || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* PPN */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-slate-500">{fmtIDR(Math.round(ppn))}</span>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-extrabold text-slate-800">{fmtIDR(Math.round(tx.total_amount))}</span>
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
