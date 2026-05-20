import { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { dbService, authService } from '../../lib/db';
import type { Transaction, Customer, Product } from '../../lib/db';
import KPIOverview from './KPIOverview';
import RevenueChart from './RevenueChart';
import CategoryDonut from './CategoryDonut';
import TopProductsTable from './TopProductsTable';
import SalesTable from './SalesTable';
import DateRangePicker from './DateRangePicker';

// ─── Shared Types ──────────────────────────────────────────────────────────
export interface ChartPoint  { label: string; amount: number; }
export interface CategoryPoint { name: string; amount: number; pct: number; count: number; color: string; }
export interface TopProductRow { rank: number; name: string; category: string; sold: number; revenue: number; img?: string; }

// ─── Color palette for categories ─────────────────────────────────────────
const PALETTE = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#64748b'];

type TimeRange = 'Today' | '7D' | '30D' | 'Custom';

// ─── Helpers ───────────────────────────────────────────────────────────────
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Filter transactions to within [rangeStart, now] or a custom date range */
function filterByRange(
  txs: Transaction[],
  range: TimeRange,
  customFrom?: string,
  customTo?: string,
): Transaction[] {
  if (range === 'Custom') {
    if (!customFrom || !customTo) return txs;
    const from = new Date(customFrom + 'T00:00:00');
    const to   = new Date(customTo   + 'T23:59:59');
    return txs.filter(tx => tx.created_at && new Date(tx.created_at) >= from && new Date(tx.created_at) <= to);
  }
  const now = new Date();
  let cutoff: Date;
  if (range === 'Today')  cutoff = startOfDay(now);
  else if (range === '7D')  cutoff = new Date(startOfDay(now).getTime() - 6 * 86_400_000);
  else                       cutoff = new Date(startOfDay(now).getTime() - 29 * 86_400_000);
  return txs.filter(tx => tx.created_at && new Date(tx.created_at) >= cutoff);
}

/** Build bar chart data points for a custom date range */
function buildCustomChartData(txs: Transaction[], fromStr: string, toStr: string): ChartPoint[] {
  const from  = startOfDay(new Date(fromStr + 'T00:00:00'));
  const to    = startOfDay(new Date(toStr   + 'T00:00:00'));
  const totalDays = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;

  if (totalDays <= 1) {
    // Single day → hourly
    const buckets: ChartPoint[] = Array.from({ length: 24 }, (_, h) => ({
      label: `${String(h).padStart(2, '0')}:00`,
      amount: 0,
    }));
    txs.forEach(tx => {
      if (!tx.created_at) return;
      const d = new Date(tx.created_at);
      buckets[d.getHours()].amount += tx.total_amount;
    });
    return buckets;
  }

  if (totalDays <= 14) {
    // Daily buckets
    const days: (ChartPoint & { ts: number })[] = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(from.getTime() + i * 86_400_000);
      return {
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        amount: 0,
        ts: d.getTime(),
      };
    });
    txs.forEach(tx => {
      if (!tx.created_at) return;
      const d = startOfDay(new Date(tx.created_at)).getTime();
      const idx = days.findIndex(x => x.ts === d);
      if (idx >= 0) days[idx].amount += tx.total_amount;
    });
    return days.map(({ label, amount }) => ({ label, amount }));
  }

  // > 14 days → 10 equal-width windows
  const windowSize = Math.ceil(totalDays / 10);
  const windows: (ChartPoint & { from: number; to: number })[] = Array.from({ length: 10 }, (_, i) => {
    const wFrom = new Date(from.getTime() + i * windowSize * 86_400_000);
    const wTo   = new Date(Math.min(wFrom.getTime() + windowSize * 86_400_000 - 1, to.getTime() + 86_399_999));
    return {
      label: `${wFrom.getDate()}/${wFrom.getMonth() + 1}`,
      from: wFrom.getTime(),
      to: wTo.getTime(),
      amount: 0,
    };
  });
  txs.forEach(tx => {
    if (!tx.created_at) return;
    const ts = new Date(tx.created_at).getTime();
    const idx = windows.findIndex(w => ts >= w.from && ts <= w.to);
    if (idx >= 0) windows[idx].amount += tx.total_amount;
  });
  return windows.map(({ label, amount }) => ({ label, amount }));
}

/** Build bar chart data points */
function buildChartData(txs: Transaction[], range: TimeRange, customFrom?: string, customTo?: string): ChartPoint[] {
  if (range === 'Custom' && customFrom && customTo) {
    return buildCustomChartData(txs, customFrom, customTo);
  }
  const now = new Date();

  if (range === 'Today') {
    // 24 hourly buckets for today
    const buckets: ChartPoint[] = Array.from({ length: 24 }, (_, h) => ({
      label: `${String(h).padStart(2,'0')}:00`,
      amount: 0,
    }));
    const todayStart = startOfDay(now).getTime();
    txs.forEach(tx => {
      if (!tx.created_at) return;
      const d = new Date(tx.created_at);
      if (d.getTime() < todayStart) return;
      buckets[d.getHours()].amount += tx.total_amount;
    });
    return buckets;
  }

  if (range === '7D') {
    // Last 7 calendar days
    const days: (ChartPoint & { ts: number })[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfDay(now).getTime() - (6 - i) * 86_400_000);
      return {
        label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        amount: 0,
        ts: d.getTime(),
      };
    });
    txs.forEach(tx => {
      if (!tx.created_at) return;
      const d = startOfDay(new Date(tx.created_at)).getTime();
      const idx = days.findIndex(x => x.ts === d);
      if (idx >= 0) days[idx].amount += tx.total_amount;
    });
    return days.map(({ label, amount }) => ({ label, amount }));
  }

  // 30D → group into 10 x 3-day windows
  const windows: (ChartPoint & { from: number; to: number })[] = Array.from({ length: 10 }, (_, i) => {
    const from = startOfDay(new Date(now.getTime() - (29 - i * 3) * 86_400_000));
    const to   = new Date(from.getTime() + 3 * 86_400_000 - 1);
    return {
      label: `${from.getDate()}/${from.getMonth() + 1}`,
      from: from.getTime(),
      to: to.getTime(),
      amount: 0,
    };
  });
  txs.forEach(tx => {
    if (!tx.created_at) return;
    const ts = new Date(tx.created_at).getTime();
    const idx = windows.findIndex(w => ts >= w.from && ts <= w.to);
    if (idx >= 0) windows[idx].amount += tx.total_amount;
  });
  return windows.map(({ label, amount }) => ({ label, amount }));
}

/** Aggregate category revenue from transaction items */
function buildCategoryData(txs: Transaction[], products: Product[]): CategoryPoint[] {
  const catMap = new Map<string, string>();
  products.forEach(p => catMap.set(p.name.toLowerCase(), p.category));

  const agg = new Map<string, { amount: number; count: number }>();
  txs.forEach(tx => {
    tx.items.forEach(item => {
      const cat = catMap.get(item.name.toLowerCase()) ?? 'Lainnya';
      const prev = agg.get(cat) ?? { amount: 0, count: 0 };
      agg.set(cat, {
        amount: prev.amount + item.price * item.quantity,
        count: prev.count + item.quantity,
      });
    });
  });

  const total = [...agg.values()].reduce((s, v) => s + v.amount, 0) || 1;
  return [...agg.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([name, { amount, count }], i) => ({
      name,
      amount,
      count,
      pct: Math.round((amount / total) * 100),
      color: PALETTE[i % PALETTE.length],
    }));
}

/** Top products by units sold */
function buildTopProducts(txs: Transaction[], products: Product[]): TopProductRow[] {
  const catMap  = new Map<string, string>();
  const imgMap  = new Map<string, string>();
  products.forEach(p => {
    catMap.set(p.name.toLowerCase(), p.category);
    imgMap.set(p.name.toLowerCase(), p.image_url);
  });

  const agg = new Map<string, { sold: number; revenue: number }>();
  txs.forEach(tx => {
    tx.items.forEach(item => {
      const key = item.name.toLowerCase();
      const prev = agg.get(key) ?? { sold: 0, revenue: 0 };
      agg.set(key, {
        sold:    prev.sold + item.quantity,
        revenue: prev.revenue + item.price * item.quantity,
      });
    });
  });

  return [...agg.entries()]
    .sort((a, b) => b[1].sold - a[1].sold)
    .slice(0, 7)
    .map(([name, { sold, revenue }], i) => ({
      rank: i + 1,
      name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: catMap.get(name) ?? '—',
      sold,
      revenue,
      img: imgMap.get(name),
    }));
}

// ─── Component ────────────────────────────────────────────────────────────
interface Props { storeId: number; refreshTrigger: number; }

export default function SalesSection({ storeId, refreshTrigger }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [timeRange,    setTimeRange]    = useState<TimeRange>('7D');
  const [customFrom,   setCustomFrom]   = useState<string>('');
  const [customTo,     setCustomTo]     = useState<string>('');
  const [storeName,    setStoreName]    = useState<string>('');
  const [isExporting,  setIsExporting]  = useState(false);

  useEffect(() => {
    Promise.all([
      dbService.getTransactions(storeId),
      dbService.getCustomers(storeId),
      dbService.getProducts(storeId),
      authService.getStoreById(storeId),
    ]).then(([txs, custs, prods, store]) => {
      setTransactions(txs);
      setCustomers(custs);
      setProducts(prods);
      if (store) setStoreName(store.name);
    });
  }, [storeId, refreshTrigger]);

  // All derived data — recomputed only when deps change
  const filteredTx   = useMemo(
    () => filterByRange(transactions, timeRange, customFrom, customTo),
    [transactions, timeRange, customFrom, customTo],
  );
  const chartData    = useMemo(
    () => buildChartData(filteredTx, timeRange, customFrom, customTo),
    [filteredTx, timeRange, customFrom, customTo],
  );
  const categoryData = useMemo(() => buildCategoryData(filteredTx, products), [filteredTx, products]);
  const topProducts  = useMemo(() => buildTopProducts(filteredTx, products),  [filteredTx, products]);

  const fmtDisplayDate = (s: string) => {
    if (!s) return '';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  };

  const rangeLabel =
    timeRange === 'Today'  ? 'Hari Ini' :
    timeRange === '7D'     ? '7 Hari Terakhir' :
    timeRange === '30D'    ? '30 Hari Terakhir' :
    (customFrom && customTo) ? `${fmtDisplayDate(customFrom)} – ${fmtDisplayDate(customTo)}` :
    'Pilih Tanggal';

  const handleDownloadCSV = () => {
    if (filteredTx.length === 0) return;
    setIsExporting(true);

    const fmtDate = (iso: string) => {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const headers = [
      'Nama Store', 'No. Order', 'Tanggal & Waktu', 'Nama Customer',
      'Kasir', 'Metode Pembayaran', 'Nama Produk', 'Kategori', 'Harga Satuan',
      'Qty', 'Subtotal', 'PPN (11%)', 'Total Pesanan'
    ];

    const rows: string[][] = [];
    filteredTx.forEach(tx => {
      const subtotalBeforeTax = tx.items.reduce((s, it) => s + it.price * it.quantity, 0);
      const ppn = subtotalBeforeTax * 0.11;
      const datetime = tx.created_at ? fmtDate(tx.created_at) : '';

      tx.items.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        rows.push([
          storeName,
          tx.order_id,
          datetime,
          tx.customer_name,
          tx.cashier_name || '—',
          tx.payment_method,
          item.name,
          item.category || '—',
          String(item.price),
          String(item.quantity),
          String(itemSubtotal),
          String(Math.round(ppn)),
          String(Math.round(tx.total_amount)),
        ]);
      });
    });

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escape).join(','),
      ...rows.map(r => r.map(escape).join(','))
    ].join('\r\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileLabel = timeRange === 'Custom' && customFrom && customTo
      ? `${customFrom}_sd_${customTo}`
      : rangeLabel.replace(/\s+/g, '-').toLowerCase();
    a.download = `laporan-penjualan-${fileLabel}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* Header + Time Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-xl leading-none">Sales Performance</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">
            Menampilkan data <span className="text-slate-600 font-semibold">{rangeLabel}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              disabled={filteredTx.length === 0 || isExporting || (timeRange === 'Custom' && (!customFrom || !customTo))}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              {isExporting ? 'Mengunduh...' : 'Unduh CSV'}
            </button>

            {/* Time Range Filter */}
            <div className="flex bg-slate-100/80 border border-slate-200/60 p-1 rounded-xl text-xs font-bold text-slate-500">
              {(['Today', '7D', '30D', 'Custom'] as TimeRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-indigo-700 shadow-sm font-extrabold'
                      : 'hover:text-slate-700'
                  }`}
                >
                  {r === 'Today' ? 'Hari Ini' : r === 'Custom' ? 'Kustom' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date range picker */}
          {timeRange === 'Custom' && (
            <DateRangePicker
              from={customFrom}
              to={customTo}
              onChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }}
            />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <KPIOverview transactions={filteredTx} customers={customers} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} timeRange={timeRange} />
        </div>
        <div>
          <CategoryDonut data={categoryData} totalOrders={filteredTx.length} />
        </div>
      </div>

      {/* Top Products */}
      <TopProductsTable data={topProducts} />

      {/* Sales Transaction List */}
      <SalesTable transactions={filteredTx} />

    </div>
  );
}
