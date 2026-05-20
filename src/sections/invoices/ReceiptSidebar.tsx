import { useState, useEffect } from 'react';
import { X, Printer, Receipt } from 'lucide-react';
import { authService } from '../../lib/db';
import type { Transaction } from '../../lib/db';

interface ReceiptSidebarProps {
  transaction: Transaction | null;
  onClose: () => void;
  storeId: number;
}

export default function ReceiptSidebar({ transaction, onClose, storeId }: ReceiptSidebarProps) {
  const [storeName, setStoreName] = useState('Kasir-Nya Store');

  // Fetch store name from database
  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const store = await authService.getStoreById(storeId);
        if (store) {
          setStoreName(store.name);
        }
      } catch (err) {
        console.error('Failed to fetch store name:', err);
      }
    };
    fetchStoreName();
  }, [storeId]);

  if (!transaction) {
    return (
      <div className="w-full lg:w-80 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-slate-400 text-center sticky top-16 h-[calc(100vh-4rem)] self-start">
        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Receipt className="h-7 w-7 text-slate-200" />
        </div>
        <span className="text-xs font-bold">Belum ada struk dipilih</span>
        <p className="text-[10px] text-slate-400 mt-1.5 max-w-[200px] leading-relaxed">
          Klik salah satu transaksi di tabel untuk menampilkan detail struk pembayaran.
        </p>
      </div>
    );
  }

  // Tax calculations
  const grandTotal = Number(transaction.total_amount);
  const subtotal = grandTotal / 1.11;
  const taxAmount = grandTotal - subtotal;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatShortDate = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="w-full lg:w-80 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col relative sticky top-16 h-[calc(100vh-4rem)] self-start">

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 h-7 w-7 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main receipt body — scrollable */}
      <div className="flex-1 overflow-y-auto p-6 pb-2">
        <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-5 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-indigo-500" />
          Struk Pembayaran
        </h3>
        
        {/* Thermal paper panel */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 font-mono text-[10px] text-slate-600 space-y-4 relative overflow-hidden shadow-inner">
          
          {/* ======= HEADER - Store Identity ======= */}
          <div className="text-center space-y-1.5 pb-1">
            <span className="font-sans font-extrabold text-slate-800 text-sm block tracking-wide leading-tight">
              {storeName.toUpperCase()}
            </span>
            <span className="block text-[8px] text-slate-400 font-semibold tracking-widest uppercase">
              Struk Resmi Pembayaran
            </span>
          </div>

          {/* Dotted separator */}
          <div className="border-t border-dashed border-slate-200" />

          {/* ======= ORDER INFO ======= */}
          <div className="space-y-1.5 text-[9px]">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">No. Invoice</span>
              <span className="font-bold text-slate-700">{transaction.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Tanggal</span>
              <span className="font-semibold text-slate-600">{formatShortDate(transaction.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Customer</span>
              <span className="font-bold text-slate-700">{transaction.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Pembayaran</span>
              <span className="font-bold text-indigo-600">{transaction.payment_method}</span>
            </div>
          </div>

          {/* Dotted separator */}
          <div className="border-t border-dashed border-slate-200" />

          {/* ======= ORDERED ITEMS ======= */}
          <div className="space-y-2.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Detail Pesanan</span>
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start font-semibold">
                  <span className="text-slate-700 max-w-[150px] leading-tight">{item.name}</span>
                  <span className="font-bold text-slate-700 shrink-0">Rp {new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</span>
                </div>
                <span className="block text-[8px] text-slate-400 font-medium">
                  {item.quantity}x @ Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                </span>
                {item.note && (
                  <span className="block text-[8px] text-slate-400 italic">
                    <span className="font-semibold not-italic text-slate-400">Catatan:</span> {item.note}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Dotted separator */}
          <div className="border-t border-dashed border-slate-200" />

          {/* ======= CALCULATIONS ======= */}
          <div className="space-y-1.5 font-semibold text-[10px]">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(subtotal))}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>PPN (11%)</span>
              <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(taxAmount))}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5" />
            <div className="flex justify-between font-extrabold text-slate-800 text-xs">
              <span>TOTAL</span>
              <span>Rp {new Intl.NumberFormat('id-ID').format(Math.round(grandTotal))}</span>
            </div>
          </div>

          {/* Dotted separator */}
          <div className="border-t border-dashed border-slate-200" />

          {/* ======= STATUS & FOOTER ======= */}
          <div className="space-y-2 text-center">
            {/* Status badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                transaction.status === 'Success' 
                  ? 'bg-emerald-100/80 text-emerald-700' 
                  : transaction.status === 'Pending' 
                    ? 'bg-amber-100/80 text-amber-700' 
                    : 'bg-rose-100/80 text-rose-700'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  transaction.status === 'Success' ? 'bg-emerald-500' : 
                  transaction.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                {transaction.status === 'Success' ? 'LUNAS' : transaction.status === 'Pending' ? 'PENDING' : 'REFUND'}
              </span>
            </div>

            {/* Barcode mockup */}
            <div className="pt-1 select-none">
              <div className="h-8 bg-slate-200/80 border-l border-r border-white flex items-center justify-center font-sans text-[7px] text-slate-500 tracking-[3px] font-bold overflow-hidden shadow-inner leading-none opacity-80 rounded-sm">
                ||| |||| | ||||| | |||| ||| ||
              </div>
            </div>

            {/* Store footer */}
            <div className="space-y-0.5 pt-1">
              <span className="text-[8px] text-slate-400 font-semibold block">{formatDate(transaction.created_at)}</span>
              <span className="text-[7px] text-slate-300 font-medium block tracking-wide">Powered by Kasir-Nya POS</span>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">Terima kasih atas kunjungan Anda!</span>
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons — always pinned to bottom */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-slate-50">
        <button 
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <html><head><title>Struk - ${transaction.order_id}</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: monospace; font-size: 11px; padding: 24px 20px; max-width: 300px; margin: 0 auto; color: #333; }
                  .center { text-align: center; }
                  .store-name { font-size: 15px; font-weight: 800; letter-spacing: 1px; }
                  .subtitle { font-size: 8px; color: #999; letter-spacing: 2px; margin-top: 3px; }
                  hr { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
                  hr.solid { border-top: 1px solid #555; }
                  .row { display: flex; justify-content: space-between; margin: 3px 0; }
                  .label { color: #888; }
                  .item-name { font-weight: 600; }
                  .item-sub { font-size: 9px; color: #999; margin: 1px 0 2px; }
                  .item-note { font-size: 9px; color: #888; font-style: italic; margin-bottom: 4px; }
                  .item-note span { font-style: normal; font-weight: 600; }
                  .total-row { font-size: 14px; font-weight: 800; margin: 6px 0; }
                  .status { display: inline-block; border: 1.5px solid #333; padding: 3px 12px; font-size: 10px; font-weight: 800; letter-spacing: 2px; margin: 8px 0; }
                  .footer { font-size: 8px; color: #aaa; margin-top: 6px; }
                  @media print { body { padding: 0; } }
                </style>
                </head><body>
                <div class="center" style="margin-bottom:12px">
                  <div class="store-name">${storeName.toUpperCase()}</div>
                  <div class="subtitle">STRUK RESMI PEMBAYARAN</div>
                </div>
                <hr>
                <div style="margin:8px 0">
                  <div class="row"><span class="label">No. Invoice</span><span style="font-weight:700">${transaction.order_id}</span></div>
                  <div class="row"><span class="label">Tanggal</span><span>${formatShortDate(transaction.created_at)}</span></div>
                  <div class="row"><span class="label">Customer</span><span style="font-weight:700">${transaction.customer_name}</span></div>
                  <div class="row"><span class="label">Pembayaran</span><span style="font-weight:700">${transaction.payment_method}</span></div>
                </div>
                <hr>
                <div style="font-size:8px;color:#aaa;font-weight:700;letter-spacing:1px;margin-bottom:6px">DETAIL PESANAN</div>
                ${transaction.items.map(item => `
                  <div class="row item-name">
                    <span>${item.name}</span>
                    <span>Rp ${new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</span>
                  </div>
                  <div class="item-sub">${item.quantity}x @ Rp ${new Intl.NumberFormat('id-ID').format(item.price)}</div>
                  ${item.note ? `<div class="item-note"><span>Catatan:</span> ${item.note}</div>` : ''}
                `).join('')}
                <hr>
                <div class="row"><span class="label">Subtotal</span><span>Rp ${new Intl.NumberFormat('id-ID').format(Math.round(subtotal))}</span></div>
                <div class="row"><span class="label">PPN (11%)</span><span>Rp ${new Intl.NumberFormat('id-ID').format(Math.round(taxAmount))}</span></div>
                <hr class="solid">
                <div class="row total-row"><span>TOTAL</span><span>Rp ${new Intl.NumberFormat('id-ID').format(Math.round(grandTotal))}</span></div>
                <hr>
                <div class="center" style="margin-top:10px">
                  <div class="status">${transaction.status === 'Success' ? 'LUNAS' : transaction.status.toUpperCase()}</div>
                  <div class="footer" style="margin-top:8px">${formatDate(transaction.created_at)}</div>
                  <div class="footer" style="margin-top:4px">Terima kasih atas kunjungan Anda!</div>
                  <div class="footer" style="margin-top:2px">Powered by Kasir-Nya POS</div>
                </div>
                </body></html>
              `);
              printWindow.document.close();
              printWindow.print();
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-xs cursor-pointer transition-all shadow-sm"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak Struk</span>
        </button>
      </div>

    </div>
  );
}
