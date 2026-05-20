import { useState, useEffect } from 'react';
import { Check, Printer, X } from 'lucide-react';
import { authService } from '../../lib/db';
import type { Transaction } from '../../lib/db';
import Modal from '../ui/Modal';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  storeId: number;
}

export default function OrderSuccessModal({ isOpen, onClose, transaction, storeId }: OrderSuccessModalProps) {
  const [storeName, setStoreName] = useState('Kasir-Nya Store');

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const store = await authService.getStoreById(storeId);
        if (store) setStoreName(store.name);
      } catch (err) {
        console.error('Failed to fetch store name:', err);
      }
    };
    if (storeId) fetchStoreName();
  }, [storeId]);

  if (!transaction) return null;

  const grandTotal = Number(transaction.total_amount);
  const subtotal = grandTotal / 1.11;
  const taxAmount = grandTotal - subtotal;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  const formatShortDate = (isoString?: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up diblokir browser. Izinkan pop-up untuk mencetak struk.');
      return;
    }

    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(Math.round(n));

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
        ${transaction.cashier_name ? `<div class="row"><span class="label">Kasir</span><span style="font-weight:700">${transaction.cashier_name}</span></div>` : ''}
        <div class="row"><span class="label">Pembayaran</span><span style="font-weight:700">${transaction.payment_method}</span></div>
      </div>
      <hr>
      <div style="font-size:8px;color:#aaa;font-weight:700;letter-spacing:1px;margin-bottom:6px">DETAIL PESANAN</div>
      ${(transaction.items ?? []).map(item => `
        <div class="row item-name">
          <span>${item.name}</span>
          <span>Rp ${fmt(item.price * item.quantity)}</span>
        </div>
        <div class="item-sub">${item.quantity}x @ Rp ${fmt(item.price)}</div>
        ${item.note ? `<div class="item-note"><span>Catatan:</span> ${item.note}</div>` : ''}
      `).join('')}
      <hr>
      <div class="row"><span class="label">Subtotal</span><span>Rp ${fmt(subtotal)}</span></div>
      <div class="row"><span class="label">PPN (11%)</span><span>Rp ${fmt(taxAmount)}</span></div>
      <hr class="solid">
      <div class="row total-row"><span>TOTAL</span><span>Rp ${fmt(grandTotal)}</span></div>
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
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Placement Success"
      description="Transaction recorded isolated under store database."
    >
      <div className="text-center">
        {/* Success icon */}
        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100/50 shadow-inner animate-pulse">
          <Check className="h-8 w-8" />
        </div>

        {/* Receipt box */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl my-5 text-left space-y-2 text-xs">
          <div className="flex justify-between font-semibold text-slate-500">
            <span>Invoice No</span>
            <span className="font-mono font-bold text-slate-700">{transaction.order_id}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-500">
            <span>Customer Name</span>
            <span className="font-bold text-slate-700">{transaction.customer_name}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-500">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-600">Rp {new Intl.NumberFormat('id-ID').format(Math.round(subtotal))}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-500">
            <span>PPN (11%)</span>
            <span className="font-semibold text-slate-600">Rp {new Intl.NumberFormat('id-ID').format(Math.round(taxAmount))}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-500 pt-2 border-t border-slate-200">
            <span>Total Paid</span>
            <span className="font-extrabold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(Math.round(grandTotal))}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-500">
            <span>Payment Method</span>
            <span className="font-extrabold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded-md text-[10px] uppercase">
              {transaction.payment_method}
            </span>
          </div>

          {/* Items list */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="pt-3 mt-1 border-t border-slate-200 space-y-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Detail Pesanan</span>
              {transaction.items.map((item, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700 flex-1 mr-2 truncate">{item.name}</span>
                    <span className="font-bold text-slate-500 shrink-0">×{item.quantity}</span>
                  </div>
                  {item.note && (
                    <p className="text-[9px] text-slate-400 italic">
                      <span className="font-semibold not-italic">Catatan:</span> {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QRIS mockup */}
        {transaction.payment_method === 'QRIS' && (
          <div className="pb-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Scan QRIS Invoice</span>
            <div className="h-32 w-32 bg-white border border-slate-150 rounded-2xl mx-auto flex items-center justify-center p-2 shadow-inner">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://kasirnya-pos.co/invoice/ORD-9911"
                alt="QRIS Mockup"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl cursor-pointer shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Cetak Struk
          </button>
          <button
            onClick={onClose}
            title="Lanjut tanpa cetak"
            className="h-full px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
