import { Check, Printer, X } from 'lucide-react';
import type { Transaction } from '../../lib/db';
import Modal from '../ui/Modal';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function OrderSuccessModal({ isOpen, onClose, transaction }: OrderSuccessModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    const subtotal = transaction.total_amount / 1.1;
    const ppn = transaction.total_amount - subtotal;
    const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(Math.round(n));
    const dateStr = transaction.created_at
      ? new Date(transaction.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      : new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const itemsHtml = (transaction.items ?? []).map(item => `
      <tr>
        <td style="padding:3px 2px;vertical-align:top">
          ${item.name}${item.note ? `<br><span style="color:#888;font-size:10px">${item.note}</span>` : ''}
        </td>
        <td style="padding:3px 2px;text-align:center;white-space:nowrap">×${item.quantity}</td>
        <td style="padding:3px 2px;text-align:right;white-space:nowrap">Rp ${fmt(item.price * item.quantity)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Struk ${transaction.order_id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',monospace;font-size:12px;width:280px;margin:0 auto;padding:16px 8px}
    .center{text-align:center}
    .divider{border-top:1px dashed #000;margin:8px 0}
    table{width:100%;border-collapse:collapse}
    .grand td{font-size:14px;font-weight:700;border-top:1px solid #000;padding-top:6px}
    @media print{@page{margin:0;size:80mm auto}body{padding:8px 4px}}
  </style>
</head>
<body>
  <div class="center">
    <div style="font-size:18px;font-weight:700;letter-spacing:3px">KASIR-NYA</div>
    <div style="font-size:10px;color:#666;margin-top:2px">Point of Sale System</div>
  </div>
  <div class="divider"></div>
  <table>
    <tr><td>Invoice</td><td style="text-align:right;font-weight:700">${transaction.order_id}</td></tr>
    <tr><td>Tanggal</td><td style="text-align:right">${dateStr}</td></tr>
    <tr><td>Customer</td><td style="text-align:right">${transaction.customer_name}</td></tr>
    ${transaction.cashier_name ? `<tr><td>Kasir</td><td style="text-align:right">${transaction.cashier_name}</td></tr>` : ''}
    <tr><td>Pembayaran</td><td style="text-align:right;font-weight:700">${transaction.payment_method}</td></tr>
  </table>
  <div class="divider"></div>
  <table>${itemsHtml}</table>
  <div class="divider"></div>
  <table>
    <tr><td style="padding:2px">Subtotal</td><td style="padding:2px;text-align:right">Rp ${fmt(subtotal)}</td></tr>
    <tr><td style="padding:2px">PPN (10%)</td><td style="padding:2px;text-align:right">Rp ${fmt(ppn)}</td></tr>
    <tr class="grand"><td style="padding:6px 2px 2px">TOTAL</td><td style="padding:6px 2px 2px;text-align:right">Rp ${fmt(transaction.total_amount)}</td></tr>
  </table>
  <div class="divider"></div>
  <div class="center" style="margin-top:10px;font-size:11px">
    <div>Terima kasih sudah berbelanja!</div>
    <div style="color:#888;font-size:10px;margin-top:4px">Simpan struk ini sebagai bukti pembayaran</div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=420,height=650');
    if (!win) {
      alert('Pop-up diblokir browser. Izinkan pop-up untuk mencetak struk.');
      return;
    }
    win.document.write(html);
    win.document.close();
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
            <span>Total Paid</span>
            <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(transaction.total_amount)}</span>
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
