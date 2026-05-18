import { Check } from 'lucide-react';
import type { Transaction } from '../../lib/db';
import Modal from '../ui/Modal';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function OrderSuccessModal({ isOpen, onClose, transaction }: OrderSuccessModalProps) {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Placement Success"
      description="Transaction recorded isolated under store database."
    >
      <div className="text-center">
        {/* Dynamic Success Checkmark Icon */}
        <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100/50 shadow-inner animate-pulse">
          <Check className="h-8 w-8" />
        </div>

        {/* Order Details Receipt Box */}
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
        </div>

        {/* QR Code demo mockup for QRIS */}
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

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl cursor-pointer shadow-md transition-all hover:scale-[1.01]"
        >
          Print Receipt and Continue
        </button>
      </div>
    </Modal>
  );
}
