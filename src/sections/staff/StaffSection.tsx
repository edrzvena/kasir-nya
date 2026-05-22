import { useState, useEffect } from 'react';
import { Users, ShieldCheck, Info } from 'lucide-react';
import { authService } from '../../lib/db';
import type { Cashier } from '../../lib/db';
import Card from '../../components/ui/Card';

interface StaffSectionProps {
  storeId: number;
  refreshTrigger: number;
}

export default function StaffSection({ storeId, refreshTrigger }: StaffSectionProps) {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);

  useEffect(() => {
    const fetchCashiers = async () => {
      const list = await authService.getCashiers(storeId);
      setCashiers(list);
    };
    fetchCashiers();
  }, [storeId, refreshTrigger]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-xl leading-none">Staff Management</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Daftar akun kasir yang terdaftar di outlet ini.</p>
        </div>
      </div>

      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-800 font-semibold">
        <Info className="h-4.5 w-4.5 shrink-0 text-indigo-500 mt-0.5" />
        <span className="leading-relaxed">
          Pendaftaran akun kasir dikelola langsung oleh penyedia layanan. Mau tambah kasir baru? <a href="https://wa.me/6281384437767" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-indigo-600">Hubungi kami</a>.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashiers.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-100/80 rounded-3xl p-10 text-center space-y-3">
            <div className="h-12 w-12 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-sm">
              <Users className="h-5.5 w-5.5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm leading-none">Belum Ada Akun Kasir</h4>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Belum ada kasir terdaftar untuk outlet ini. Hubungi penyedia layanan untuk menambahkan akun kasir.
            </p>
          </div>
        ) : (
          cashiers.map((cashier) => (
            <Card key={cashier.id} className="p-5 flex flex-col justify-between h-36 text-left">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                  {cashier.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-extrabold text-slate-800 text-sm truncate leading-snug" title={cashier.name}>
                    {cashier.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-indigo-500 block tracking-normal mt-0.5 truncate" title={cashier.email}>
                    {cashier.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Aktif</span>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-650 font-mono">
                  Kasir
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
